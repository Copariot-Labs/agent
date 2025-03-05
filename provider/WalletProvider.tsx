'use client';

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren, useEffect } from "react";
import { AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { PetraWallet } from "petra-plugin-wallet-adapter";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const wallets = [
    new PetraWallet()
  ];
  
  const config = new AptosConfig({
    network: Network.TESTNET,
    fullnode: 'https://mainnet.movementnetwork.xyz/v1',
    faucet: 'https://faucet.testnet.bardock.movementnetwork.xyz/'
  });

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      dappConfig={config}
      onError={(error) => {
        console.error("钱包错误:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}; 