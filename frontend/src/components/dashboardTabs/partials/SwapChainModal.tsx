import React from "react";
import useChain from "../../../hooks/useChain";
import { X } from "lucide-react";

export default function SwapChainModal({ isOpen, onClose, onSelect }: any) {
  const { chains, loading, error } = useChain();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#1A1A1A] p-6 rounded-xl w-80  relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Select Chain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading chains…</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll">
          {chains.slice(0, 20).map((chain: any) => (
            <button
              key={chain.chainId || chain.chain}
              onClick={() => {
                onSelect({
                  key: chain.key,
                  label: chain.label,
                  nativeSymbol: chain.nativeSymbol,
                  decimals: chain.decimals,
                  chainId: chain.chainId,
                  logo: chain.logo,
                });
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-white/10 text-left cursor-pointer"
            >
              <img src={chain.logo} alt="" width={25} height={25} />
              <span className="text-white">
                {chain.label} ({chain.nativeSymbol || "N/A"})
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
