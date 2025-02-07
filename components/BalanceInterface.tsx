'use client';

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { aptos, CONTRACT_FUNCTIONS } from "@/utils/contract"

export interface BalanceResult {
  move: number;
  usdt: number;
  weusd: number;
  pipi: number;
}

export async function getBalances(address: string): Promise<BalanceResult> {
  try {
    // Get MOVE balance
    const moveResponse = await aptos.view({
      payload: {
        function: CONTRACT_FUNCTIONS.GET_MOVE_BALANCE,
        functionArguments: [address]
      }
    });

    // Get USDT balance
    const usdtResponse = await aptos.view({
      payload: {
        function: CONTRACT_FUNCTIONS.GET_USDT_BALANCE,
        functionArguments: [address]
      }
    });

    // Get WeUSD balance
    const weusdResponse = await aptos.view({
      payload: {
        function: CONTRACT_FUNCTIONS.GET_WEUSD_BALANCE,
        functionArguments: [address]
      }
    });

    // Get PIPI balance
    const pipiResponse = await aptos.view({
      payload: {
        function: CONTRACT_FUNCTIONS.GET_PIPI_BALANCE,
        functionArguments: [address]
      }
    });

    return {
      move: moveResponse?.[0] ? Number(moveResponse[0]) / 1e8 : 0,
      usdt: usdtResponse?.[0] ? Number(usdtResponse[0]) / 1e6 : 0,
      weusd: weusdResponse?.[0] ? Number(weusdResponse[0]) / 1e6 : 0,
      pipi: pipiResponse?.[0] ? Number(pipiResponse[0]) / 1e6 : 0
    };
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
}

export default function BalanceInterface() {
  const [balance, setBalance] = useState<BalanceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { account } = useWallet()

  const handleCheckBalance = async () => {
    if (!account) return
    
    setIsLoading(true)
    try {
      const balances = await getBalances(account.address.toString())
      setBalance(balances)
    } catch (error) {
      console.error('Balance check failed:', error)
      alert('Failed to fetch balance')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Token Balances</h3>
      {!balance ? (
        <Button 
          onClick={handleCheckBalance} 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Loading...' : 'Check Balance'}
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-amber-200">
            <div className="text-sm text-amber-700 mb-1">MOVE</div>
            <div className="text-xl font-bold text-amber-800">{balance.move.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200">
            <div className="text-sm text-rose-700 mb-1">USDT</div>
            <div className="text-xl font-bold text-rose-800">{balance.usdt.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200">
            <div className="text-sm text-teal-700 mb-1">WeUSD</div>
            <div className="text-xl font-bold text-teal-800">{balance.weusd.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-[#FFDD24] to-amber-100 p-4 rounded-2xl border border-amber-200">
            <div className="text-sm text-amber-800 mb-1">PIPI</div>
            <div className="text-xl font-bold text-amber-900">{balance.pipi.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

