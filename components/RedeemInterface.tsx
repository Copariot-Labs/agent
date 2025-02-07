'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"

// 创建单例配置
const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
  faucet: 'https://fund.testnet.porto.movementlabs.xyz/'
})
const aptos = new Aptos(config)

// 添加类型定义
type SignAndSubmitTransaction = (transaction: InputTransactionData) => Promise<{ hash: string }>;

// 导出 redeem 函数供其他组件使用
export const redeemPIPI = async (
  amount: string,
  signAndSubmitTransaction: SignAndSubmitTransaction,
  account: { address: string }
) => {
  const amountWithDecimals = Math.floor(parseFloat(amount) * 1e6).toString();
  
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: "0x7b6a82f3999a6adf16476a601d678ea549880d786b055c600b5f81794130c89d::weusd_operations::redeemWeUSD",
      functionArguments: [amountWithDecimals, []],
    },
  });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  return response;
}

export default function RedeemInterface() {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { account, signAndSubmitTransaction } = useWallet()

  const handleRedeem = async () => {
    if (!account || !amount) return
    
    setIsLoading(true)
    try {
      await redeemPIPI(amount, signAndSubmitTransaction, account)
      alert('Redeem successful!')
    } catch (error) {
      console.error('Redeem failed:', error)
      alert('Redeem failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  // 计算手续费
  const fee = amount ? parseFloat(amount) * 0.01 : 0

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Redeem WeUSD</h3>
      <div className="mb-2 text-sm text-gray-600">
        Note: 1% fee will be charged for WeUSD redemption
      </div>
      <Input
        type="number"
        placeholder="Enter amount of WeUSD to redeem"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-2 rounded-full"
      />
      {amount && (
        <div className="text-sm text-gray-600 mb-4">
          Fee: {fee.toFixed(6)} WeUSD
          <br />
          You will receive: {(parseFloat(amount) - fee).toFixed(6)} WeUSD
        </div>
      )}
      <Button 
        onClick={handleRedeem} 
        disabled={isLoading || !amount}
        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
      >
        {isLoading ? 'Redeeming...' : 'Redeem WeUSD'}
      </Button>
    </div>
  )
}

