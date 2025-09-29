import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  wallet: ethers.Wallet | null;
  setWallet: (w: ethers.Wallet | null) => void;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  setWallet: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
