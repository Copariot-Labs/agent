import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function BalanceInterface() {
  const [balance] = useState<number | null>(null)

  const handleCheckBalance = () => {
    // TODO: 实现实际的余额查询逻辑
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">PIPI 余额</h3>
      {balance === null ? (
        <Button onClick={handleCheckBalance} className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full py-2 transition-all duration-200 ease-in-out transform hover:scale-105">
          查看余额
        </Button>
      ) : (
        <p className="text-center text-3xl font-bold text-purple-600">{balance.toFixed(2)} PIPI</p>
      )}
    </div>
  )
}

