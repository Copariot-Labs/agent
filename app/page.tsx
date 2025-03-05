'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send } from 'lucide-react'
import QuickCommands from '@/components/QuickCommands'
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react"
import { WalletSelector } from '@/components/WalletSelector'
import { mintPIPI } from '@/components/MintInterface'
import { getBalances} from '@/components/BalanceInterface'
import { redeemPIPI } from '@/components/RedeemInterface'
import { claimMove, claimUSDT } from '@/components/FaucetInterface'
import ReactMarkdown from 'react-markdown'

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
  actionType?: 'mint' | 'redeem' | 'balance' | 'faucet';
  actionData?: ActionData;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your friendly WEUSD assistant 🐸. I can help you mint/redeem WEUSD and check your token balances. Note: PIPI token will be automatically generated on your first WEUSD mint!'
    }
  ])
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false)

  // useWallet hook
  const { connect, disconnect, account, connected, wallets, signAndSubmitTransaction } = useWallet();

  // Add a new state to control the display of the thinking process
  const [showThinking, setShowThinking] = useState<{[key: number]: boolean}>({});

  const toggleThinking = (index: number) => {
    setShowThinking(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Process message content, separate thinking process and actual reply
  const processMessage = (content: string) => {
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    const think = thinkMatch ? thinkMatch[1].trim() : null;
    const actualContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    return { think, actualContent };
  };

  const handleConnectWallet = async () => {
    if (connected) {
      await disconnect();
    } else {
      setIsWalletSelectorOpen(true);
    }
  }

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      console.log("Trying to connect wallet:", walletName);
      await connect(walletName);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet, please make sure the selected wallet is installed and allowed to connect.");
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

  // Add automatic scrolling effect
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
    // Use setTimeout to ensure scrolling after DOM update
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
          content: 'To start minting WEUSD, we need to connect your wallet first. Click the button below to connect! 🦊',
          isAction: true
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Great! Wallet connected. Please enter the amount of WEUSD you want to mint. Note: If this is your first mint, you\'ll also receive PIPI tokens!',
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
          content: 'To redeem WEUSD, we need to connect your wallet first. Would you like to connect now?',
          isAction: true
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Alright, let\'s redeem your WEUSD. Please enter the amount you want to redeem (1% fee will be charged):',
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

    // Check for faucet-related keywords
    if (normalizedCommand.includes('faucet')) {
      if (!connected) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'To use the faucet, we need to connect your wallet first. Would you like to connect now?',
          isAction: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Please select which token you would like to claim. For native MOVE tokens, please visit the official faucet:',
          isAction: true,
          actionType: 'faucet'
        }]);
      }
      return;
    }

    // If not a specific command, send to LLM
    sendToLLM(command)
  }

  const sendToLLM = async (message: string) => {
    try {
      setIsThinking(true)

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      })

      clearTimeout(timeoutId);

      const data = await response.json()

      // Use the original markdown text directly
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text
      }])

      // If a specific intent is detected, add the corresponding action prompt
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
      let errorMessage = 'Oops, something went wrong. Shall we try again later? 😅'

      if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = 'Request timeout. The server is taking too long to respond. Please try again.'
      } else if (error instanceof Error) {
        // Add more specific error information
        errorMessage = `Error: ${error.message} 😅`
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
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
      const balances = await getBalances(account.address.toString());

      if (type === 'all') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-amber-200">
                <div class="text-sm text-amber-700 mb-1">MOVE</div>
                <div class="text-xl font-bold text-amber-800">${balances.move.toFixed(2)}</div>
              </div>
              <div class="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200">
                <div class="text-sm text-rose-700 mb-1">USDT</div>
                <div class="text-xl font-bold text-rose-800">${balances.usdt.toFixed(2)}</div>
              </div>
              <div class="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200">
                <div class="text-sm text-teal-700 mb-1">WEUSD</div>
                <div class="text-xl font-bold text-teal-800">${balances.weusd.toFixed(2)}</div>
              </div>
              <div class="bg-gradient-to-br from-[#FFDD24] to-amber-100 p-4 rounded-2xl border border-amber-200">
                <div class="text-sm text-amber-800 mb-1">PIPI</div>
                <div class="text-xl font-bold text-amber-900">${balances.pipi.toFixed(2)}</div>
              </div>
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

  const handleFaucetClaim = async (type: 'move' | 'usdt') => {
    try {
      if (!account) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Please connect your wallet first!'
        }])
        return
      }

      setIsThinking(true)
      const claimFunction = type === 'move' ? claimMove : claimUSDT
      const result = await claimFunction(signAndSubmitTransaction, account)
      const shortHash = `${result.hash.slice(0, 6)}...${result.hash.slice(-4)}`
      const explorerUrl = `https://explorer.movementnetwork.xyz/txn/${result.hash}?network=testnet`
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Success! 🎉 Claimed ${type.toUpperCase()}! Tx: <a href="${explorerUrl}" target="_blank" class="text-blue-500 hover:text-blue-700 underline">${shortHash}</a>`
      }])
    } catch (error) {
      console.error('Claim error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, ${type.toUpperCase()} claim failed. Please try again 😢`
      }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#FFE450] to-[#FFFDF2]">
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <WalletSelector
          wallets={wallets ? [...wallets] : []}
          onSelect={handleWalletSelect}
          isOpen={isWalletSelectorOpen}
          onClose={() => setIsWalletSelectorOpen(false)}
        />
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 rounded-3xl overflow-hidden h-[90vh] flex flex-col bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-black border-b border-[#DDDDDD] p-4">
            <CardTitle className="text-center flex items-center justify-center text-xl font-bold">
              <Image className='w-8 h-auto' src="/images/logo.png" alt="PIPI Agent" width={51} height={61} />
              <span className='ml-2'>PIPI Agent </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow overflow-hidden">
            <ScrollArea className="h-full w-full pr-4" ref={scrollAreaRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-[#F3F4F6] border border-[#E7EAF0] text-[#333333]'
                  } max-w-[85%]`}>
                    {msg?.content ? (
                      <div className={`prose prose-amber prose-headings:mb-2 prose-headings:mt-0 prose-p:mb-0 prose-p:mt-0 prose-li:mb-0 prose-li:mt-0 max-w-none ${
                        msg.role === 'user' ? 'text-white' : 'text-[#333333]'
                      }`}>
                        {msg.content.includes('<') ? (
                          <>
                            {(() => {
                              const { think, actualContent } = processMessage(msg.content);
                              return (
                                <>
                                  <div dangerouslySetInnerHTML={{ __html: actualContent }} />
                                  {think && (
                                    <div className="mt-2">
                                      <button
                                        onClick={() => toggleThinking(index)}
                                        className="text-sm text-amber-600 hover:text-amber-700 underline"
                                      >
                                        {showThinking[index] ? 'Hide thinking process' : 'Show thinking process'}
                                      </button>
                                      {showThinking[index] && (
                                        <div className="mt-2 p-2 bg-amber-50 rounded-lg text-sm">
                                          <ReactMarkdown>{think}</ReactMarkdown>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    ) : (
                      'Message content is empty'
                    )}
                    {msg.isAction && !connected && (
                      <Button
                        onClick={handleConnectWallet}
                        className="mt-2 bg-[#FFE450] text-black rounded-full transition-all duration-200 ease-in-out transform
                          hover:scale-105 hover:bg-[#FFE450]
                        "
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
                        <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">Mint</Button>
                      </form>
                    )}
                    {msg.isAction && connected && msg.actionType === 'redeem' && (
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        const amount = (e.target as HTMLFormElement).amount.value
                        handleRedeem(amount)
                      }} className="mt-3">
                        <Input name="amount" type="number" placeholder="Enter Redeem amount" className="mb-2" />
                        <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">Redeem</Button>
                      </form>
                    )}
                    {msg.isAction && connected && msg.actionType === 'faucet' && (
                      <div className="mt-3 space-y-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleFaucetClaim('move')}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white"
                          >
                            Claim FA Move
                          </Button>
                          <Button
                            onClick={() => handleFaucetClaim('usdt')}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                          >
                            Claim USDT
                          </Button>
                        </div>
                        <a
                          href="https://faucet.movementnetwork.xyz/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center p-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                          🎯 Get Native MOVE from Official Faucet
                        </a>
                      </div>
                    )}
                    {msg.isAction && connected && msg.actionType === 'balance' && msg.actionData && 'balance' in msg.actionData && (
                      <p className="mt-3 text-2xl font-bold text-amber-700">{msg.actionData.balance} PIPI</p>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="mb-4 text-left">
                  <div className="inline-block p-3 rounded-2xl bg-[#F3F4F6] border border-[#E7EAF0] text-[#333333] animate-pulse">
                    PIPI is thinking... 🤔
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <div className='w-full px-3 pb-3'>
            <CardFooter className="flex flex-col items-start space-y-3 p-4 rounded-[20px] border border-[#E7EAF0] bg-[#F3F4F6]">
              <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Chat with me..."
                  className="flex-grow border-none outline-none py-2 px-4"
                  disabled={isThinking}
                />
                <div className='mt-5 flex items-center justify-between'>
                  <QuickCommands onSelect={handleCommand} />
                  <Button
                    type="submit"
                    className="bg-[#FFE450] text-black rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ease-in-out transform
                      hover:scale-105 hover:bg-[#FFE450]
                    "
                    disabled={isThinking}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  )
}
