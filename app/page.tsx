'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send } from 'lucide-react'
import QuickCommands from '@/components/QuickCommands'
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react"
import { WalletSelector } from '@/components/WalletSelector'
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"
import { mintPIPI } from '@/components/MintInterface'
import { getBalances } from '@/utils/balance'
import { redeemPIPI } from '@/components/RedeemInterface'

type BalancesData = {
  move: number;
  usdt: number;
  weusd: number;
  pipi: number;
};

type PipiBalanceData = {
  balance: number;
};

type ActionData = BalancesData | PipiBalanceData;

interface Message {
  role: string;
  content: string;
  isAction?: boolean;
  actionType?: 'mint' | 'redeem' | 'balance';
  actionData?: ActionData;
}

// 在组件外部创建配置
const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
  faucet: 'https://fund.testnet.porto.movementlabs.xyz/'
})
const aptos = new Aptos(config)

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your friendly WeUSD assistant 🐸. I can help you mint/redeem WeUSD and check your token balances. Note: PIPI token will be automatically generated on your first WeUSD mint!' 
    }
  ])
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false)
  
  // 使用 useWallet hook
  const { connect, disconnect, account, connected, wallets, signAndSubmitTransaction } = useWallet();

  const handleConnectWallet = async () => {
    if (connected) {
      await disconnect();
    } else {
      setIsWalletSelectorOpen(true);
    }
  }

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      console.log("尝试连接钱包:", walletName);
      await connect(walletName);
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert("连接钱包失败，请确保已安装所选钱包并允许连接。");
    }
  }

  useEffect(() => {
    if (connected) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Wallet connected! Address: ${account?.address?.toString().slice(0, 6)}...${account?.address?.toString().slice(-4)}` 
      }]);
    }
  }, [connected, account]);

  // 添加自动滚动效果
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

    scrollToBottom();
    // 使用 setTimeout 确保在 DOM 更新后滚动
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    handleCommand(input)
  }

  const handleCommand = (command: string) => {
    // Convert command to lowercase and remove extra spaces
    const normalizedCommand = command.toLowerCase().trim()
    
    // Check for mint-related keywords
    if (normalizedCommand.includes('mint')) {
      if (!connected) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'To start minting WeUSD, we need to connect your wallet first. Click the button below to connect! 🦊', 
          isAction: true 
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Great! Wallet connected. Please enter the amount of WeUSD you want to mint. Note: If this is your first mint, you\'ll also receive PIPI tokens!', 
          isAction: true,
          actionType: 'mint'
        }])
      }
      return
    }

    // Check for redeem-related keywords
    if (normalizedCommand.includes('redeem')) {
      if (!connected) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'To redeem WeUSD, we need to connect your wallet first. Would you like to connect now?', 
          isAction: true 
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Alright, let\'s redeem your WeUSD. Please enter the amount you want to redeem (1% fee will be charged):', 
          isAction: true,
          actionType: 'redeem'
        }])
      }
      return
    }

    // Check for balance-related keywords
    if (normalizedCommand.includes('balance')) {
      if (!connected) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'To check your balance, we need to connect your wallet first. Would you like to connect now?', 
          isAction: true 
        }]);
      } else {
        if (normalizedCommand.includes('all')) {
          handleBalance('all');
        } else {
          handleBalance('pipi');
        }
      }
      return;
    }

    // If not a specific command, send to LLM
    sendToLLM(command)
  }

  const sendToLLM = async (message: string) => {
    try {
      setIsThinking(true)
      // 使用相对路径而不是完整 URL
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
      })
      const data = await response.json()
      
      // 添加LLM的回复
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.text 
      }])

      // 如果检测到特定意图，添加相应的操作提示
      if (data.intent) {
        const actionMessage = { role: 'assistant', content: '', isAction: true } as Message;
        
        if (!connected) {
          actionMessage.content = 'To proceed, we need to connect your wallet first. Would you like to connect now? 🦊'
        } else {
          switch (data.intent) {
            case 'mint':
              actionMessage.content = 'Please enter the amount of PIPI you want to mint:'
              actionMessage.actionType = 'mint'
              break
            case 'redeem':
              actionMessage.content = 'Please enter the amount of PIPI you want to redeem:'
              actionMessage.actionType = 'redeem'
              break
            case 'balance':
              handleBalance()
              return
            case 'wallet':
              actionMessage.content = 'Your wallet is already connected! ✅'
              break
          }
        }
        
        setMessages(prev => [...prev, actionMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Oops, something went wrong. Shall we try again later? 😅' 
      }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleMint = async (amount: string) => {
    try {
      if (!account) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Please connect your wallet first!' 
        }])
        return
      }

      setIsThinking(true)
      const mintResult = await mintPIPI(amount, signAndSubmitTransaction, account)
      const shortHash = `${mintResult.hash.slice(0, 6)}...${mintResult.hash.slice(-4)}`
      const explorerUrl = `https://explorer.movementnetwork.xyz/txn/${mintResult.hash}?network=testnet`
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Success! 🎉 Tx: <a href="${explorerUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 underline">${shortHash}</a>` 
      }])
    } catch (error) {
      console.error('Mint error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, mint failed. Please try again 😢' 
      }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleRedeem = async (amount: string) => {
    try {
      if (!account) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Please connect your wallet first!' 
        }])
        return
      }

      setIsThinking(true)
      const redeemResult = await redeemPIPI(amount, signAndSubmitTransaction, account)
      const shortHash = `${redeemResult.hash.slice(0, 6)}...${redeemResult.hash.slice(-4)}`
      const explorerUrl = `https://explorer.movementnetwork.xyz/txn/${redeemResult.hash}?network=testnet`
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Success! 🎉 Tx: <a href="${explorerUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 underline">${shortHash}</a>` 
      }])
    } catch (error) {
      console.error('Redeem error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, redeem failed. Please try again 😢' 
      }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleBalance = async (type: 'all' | 'pipi' = 'pipi') => {
    try {
      if (!account) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Please connect your wallet first!' 
        }]);
        return;
      }

      setIsThinking(true);
      const balances = await getBalances(account.address.toString(), aptos);

      if (type === 'all') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `
            <div class="balance-table">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th class="py-2 px-4 bg-purple-100">Token</th>
                    <th class="py-2 px-4 bg-purple-100">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="py-2 px-4 border-t">MOVE</td>
                    <td class="py-2 px-4 border-t">${balances.move.toFixed(8)}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border-t">USDT</td>
                    <td class="py-2 px-4 border-t">${balances.usdt.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border-t">WeUSD</td>
                    <td class="py-2 px-4 border-t">${balances.weusd.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 border-t">PIPI</td>
                    <td class="py-2 px-4 border-t">${balances.pipi.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `,
          isAction: true,
          actionType: 'balance',
          actionData: balances
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Your PIPI balance is ${balances.pipi.toFixed(2)} PIPI`, 
          isAction: true,
          actionType: 'balance',
          actionData: { balance: balances.pipi }
        }]);
      }
    } catch (error) {
      console.error('Balance check error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, failed to fetch balance. Please try again later 😢'
      }]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 min-h-screen flex items-center justify-center">
      <WalletSelector
        wallets={wallets ? [...wallets] : []}
        onSelect={handleWalletSelect}
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 rounded-3xl overflow-hidden h-[90vh] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-4">
          <CardTitle className="text-center text-white flex items-center justify-center text-xl font-bold">
            <Sparkles className="mr-2" />
            🐸 PIPI Agent 🐸
            <Sparkles className="ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full pr-4" ref={scrollAreaRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                    : 'bg-white shadow-md text-gray-800'
                } max-w-[85%]`}>
                  {msg?.content ? (
                    msg.content.includes('<table') || msg.content.includes('<a') ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    ) : (
                      msg.content
                    )
                  ) : (
                    '消息内容为空'
                  )}
                  {msg.isAction && !connected && (
                    <Button 
                      onClick={handleConnectWallet}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                      Connect Wallet
                    </Button>
                  )}
                  {msg.isAction && connected && msg.actionType === 'mint' && (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      const amount = (e.target as HTMLFormElement).amount.value
                      handleMint(amount)
                    }} className="mt-3">
                      <Input name="amount" type="number" placeholder="Enter Mint amount" className="mb-2" />
                      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">Mint</Button>
                    </form>
                  )}
                  {msg.isAction && connected && msg.actionType === 'redeem' && (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      const amount = (e.target as HTMLFormElement).amount.value
                      handleRedeem(amount)
                    }} className="mt-3">
                      <Input name="amount" type="number" placeholder="Enter Redeem amount" className="mb-2" />
                      <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">Redeem</Button>
                    </form>
                  )}
                  {msg.isAction && connected && msg.actionType === 'balance' && msg.actionData && 'balance' in msg.actionData && (
                    <p className="mt-3 text-2xl font-bold text-purple-600">{msg.actionData.balance} PIPI</p>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="mb-4 text-left">
                <div className="inline-block p-3 rounded-2xl bg-white shadow-md text-gray-800 animate-pulse">
                  PIPI is thinking... 🤔
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 p-4 bg-white rounded-t-3xl shadow-inner">
          <QuickCommands onSelect={handleCommand} />
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chat with me..."
              className="flex-grow border-2 border-gray-200 focus:border-purple-400 rounded-full py-2 px-4"
              disabled={isThinking}
            />
            <Button 
              type="submit"
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105"
              disabled={isThinking}
            >
              <Send size={18} />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}