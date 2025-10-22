import React, { useState } from "react";
import useTokens from "../../../hooks/useTokens";
import { X } from "lucide-react";

export default function SwapTokenModal({ isOpen, onClose, onSelect, chainKey }: any) {
  const { tokens, loading, error } = useTokens(chainKey);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
      setSearchQuery("");
    }
  };

  const filteredTokens = tokens.filter((token: any) =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-[#08071a] p-6 rounded-xl w-80 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Select Token</h2>
          <button 
            onClick={() => {
              onClose();
              setSearchQuery("");
            }}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md bg-[#02080E8C] px-4 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        {loading && <p className="text-gray-400">Loading tokens…</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll">
          {filteredTokens.length === 0 && !loading && (
            <p className="text-gray-400 text-center py-4">No tokens found</p>
          )}
          
          {filteredTokens.map((token: any, idx: number) => (
            <button
              key={token.address || token.symbol + idx}
              disabled={token.changeNowSupported === false || !token.changeNowTicker}
              onClick={() => {
                if (token.changeNowSupported === false || !token.changeNowTicker) return;
                onSelect({
                  symbol: token.symbol,
                  decimals: token.decimals,
                  address: token.address,
                  logo: token.logo,
                  binanceSymbol: token.binanceSymbol,
                  changeNowTicker: token.changeNowTicker,
                  native: token.native || false,
                });
                onClose();
                setSearchQuery("");
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-md text-left ${
                token.changeNowSupported === false || !token.changeNowTicker
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-white/2 cursor-pointer"
              }`}
            >
              <img src={token.logo} alt={token.symbol} className="h-6 w-6 rounded-full" />
              <span className="text-white">{token.symbol}</span>
              {token.native && (
                <span className="ml-auto text-xs text-gray-400">Native</span>
              )}
              {token.changeNowSupported === false || !token.changeNowTicker ? (
                <span className="ml-auto text-xs text-red-400">Unavailable</span>
              ) : null}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onClose();
            setSearchQuery("");
          }}
          className="mt-4 w-full py-2 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}