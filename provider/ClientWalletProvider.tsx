'use client';

import { PropsWithChildren } from "react";
import { WalletProvider } from "./WalletProvider";

export function ClientWalletProvider({ children }: PropsWithChildren) {
  return <WalletProvider>{children}</WalletProvider>;
} 