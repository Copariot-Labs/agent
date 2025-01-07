'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, WalletName, AptosStandardSupportedWallet } from "@aptos-labs/wallet-adapter-react";
import Image from 'next/image';

interface WalletSelectorProps {
  wallets: (Wallet | AptosStandardSupportedWallet<string>)[];
  onSelect: (walletName: WalletName) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSelector({ wallets, onSelect, isOpen, onClose }: WalletSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => {
                onSelect(wallet.name as WalletName);
                onClose();
              }}
              className="flex items-center justify-start gap-3 w-full p-4"
              variant="outline"
            >
              {wallet.icon && (
                <div className="w-6 h-6 relative">
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              )}
              <span>{wallet.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 