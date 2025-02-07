'use client';

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react"
import { aptos, CONTRACT_FUNCTIONS } from "@/utils/contract"

// Add type definition
type SignAndSubmitTransaction = (transaction: InputTransactionData) => Promise<{ hash: string }>;

// Export faucet functions
export const claimMove = async (
  signAndSubmitTransaction: SignAndSubmitTransaction,
  account: { address: string }
) => {
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: CONTRACT_FUNCTIONS.CLAIM_MOVE,
      functionArguments: [],
    },
  });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  return response;
}

export const claimUSDT = async (
  signAndSubmitTransaction: SignAndSubmitTransaction,
  account: { address: string }
) => {
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: CONTRACT_FUNCTIONS.CLAIM_USDT,
      functionArguments: [],
    },
  });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  return response;
}

export default function FaucetInterface() {
  const [isLoadingMove, setIsLoadingMove] = useState(false)
  const [isLoadingUSDT, setIsLoadingUSDT] = useState(false)
  const { account, signAndSubmitTransaction } = useWallet()

  const handleClaimMove = async () => {
    if (!account) return
    
    setIsLoadingMove(true)
    try {
      await claimMove(signAndSubmitTransaction, account)
      alert('Claimed Move tokens successfully!')
    } catch (error) {
      console.error('Claim Move failed:', error)
      alert('Claim Move failed, please try again')
    } finally {
      setIsLoadingMove(false)
    }
  }

  const handleClaimUSDT = async () => {
    if (!account) return
    
    setIsLoadingUSDT(true)
    try {
      await claimUSDT(signAndSubmitTransaction, account)
      alert('Claimed USDT tokens successfully!')
    } catch (error) {
      console.error('Claim USDT failed:', error)
      alert('Claim USDT failed, please try again')
    } finally {
      setIsLoadingUSDT(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Faucet</h3>
      <div className="flex gap-4">
        <Button 
          onClick={handleClaimMove} 
          disabled={isLoadingMove}
          className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isLoadingMove ? 'Claiming...' : 'Claim Move'}
        </Button>
        <Button 
          onClick={handleClaimUSDT} 
          disabled={isLoadingUSDT}
          className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isLoadingUSDT ? 'Claiming...' : 'Claim USDT'}
        </Button>
      </div>
    </div>
  )
} 