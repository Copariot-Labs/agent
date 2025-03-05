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

        if (wallets && wallets.length > 0) {
          await connect(wallets[0].name as WalletName);
        } else {

          alert("Please install the Petra wallet extension first!");
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet, please ensure Petra wallet is installed and allowed to connect.");
      }
    }
  }

  // Listen to wallet connection status
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
          ? `Connected: ${account?.address?.toString().slice(0, 6)}...${account?.address?.toString().slice(-4)}`
          : "Connect Wallet"}
      </Button>
    </div>
  )
}

