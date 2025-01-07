'use client';

import { Button } from "@/components/ui/button"
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react"
import { useEffect } from "react";

export default function WalletConnect() {
  const { connect, disconnect, account, connected, wallets } = useWallet();

  const handleConnect = async () => {
    if (connected) {
      await disconnect();
    } else {
      try {
        // 尝试连接到第一个可用的钱包
        if (wallets && wallets.length > 0) {
          await connect(wallets[0].name as WalletName);
        } else {
          // 如果没有检测到钱包，提示用户安装
          alert("请先安装 Petra 钱包扩展！");
        }
      } catch (error) {
        console.error("连接钱包失败:", error);
        alert("连接钱包失败，请确保已安装 Petra 钱包并允许连接。");
      }
    }
  }

  // 监听钱包连接状态
  useEffect(() => {
    if (connected) {
    }
  }, [connected, account]);

  return (
    <div className="fixed bottom-4 right-4">
      <Button 
        onClick={handleConnect}
        className="bg-gradient-to-r from-pink-400 to-purple-400 text-white"
      >
        {connected 
          ? `已连接: ${account?.address?.toString().slice(0, 6)}...${account?.address?.toString().slice(-4)}`
          : "连接钱包"}
      </Button>
    </div>
  )
}

