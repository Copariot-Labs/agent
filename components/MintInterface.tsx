'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react"
import { aptos, CONTRACT_FUNCTIONS } from "@/utils/contract"

// 添加类型定义
type SignAndSubmitTransaction = (transaction: InputTransactionData) => Promise<{ hash: string }>;

// 导出 mint 函数供其他组件使用
export const mintPIPI = async (
  amount: string, 
  signAndSubmitTransaction: SignAndSubmitTransaction, 
  account: { address: string }
) => {
  // Convert amount to correct decimals (multiply by 1e6)
  const amountWithDecimals = Math.floor(parseFloat(amount) * 1e6).toString();
  
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: CONTRACT_FUNCTIONS.MINT_WEUSD,
      functionArguments: [amountWithDecimals, []],
    },
  });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  return response;
}

export default function MintInterface() {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { account, signAndSubmitTransaction } = useWallet()

  const handleMint = async () => {
    if (!account || !amount) return
    
    setIsLoading(true)
    try {
      await mintPIPI(amount, signAndSubmitTransaction, account)
      alert('Mint successful!')
    } catch (error) {
      console.error('Mint failed:', error)
      alert('Mint failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Mint WeUSD</h3>
      <div className="mb-2 text-sm text-gray-600">
        First-time minters will receive PIPI tokens automatically!
      </div>
      <Input
        type="number"
        placeholder="Enter amount of WeUSD to mint"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-4 rounded-full"
      />
      <Button 
        onClick={handleMint} 
        disabled={isLoading || !amount}
        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
      >
        {isLoading ? 'Minting...' : 'Mint WeUSD'}
      </Button>
    </div>
  )
}

