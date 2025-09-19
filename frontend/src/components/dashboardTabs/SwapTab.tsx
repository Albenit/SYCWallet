import React, { useState } from "react";
import useChain from "../../hooks/useChain";

export default function SwapTab() {
  const { chain, loading, error, fetchChain } = useChain();

  const [fromChainKey, setFromChainKey] = useState("");
  const [toChainKey, setToChainKey] = useState("");
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const handleFromChainChange = (key: string) => {
    setFromChainKey(key);
    setFromToken(null);
    if (key) fetchChain(key); // get tokens for this chain from backend
  };

  const handleToChainChange = (key: string) => {
    setToChainKey(key);
    setToToken(null);
    if (key) fetchChain(key);
  };

  return (
    <div className="space-y-6">
      {/* FROM */}
      <div className="bg-[#1d1f24] rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-2">From</p>

        <select
          value={fromChainKey}
          onChange={(e) => handleFromChainChange(e.target.value)}
          className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10"
        >
          <option value="">Select Chain</option>
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="bsc">BNB Chain</option>
          <option value="sepolia">Sepolia</option>
        </select>

        {chain?.tokens?.length > 0 && (
          <select
            value={fromToken?.address || ""}
            onChange={(e) => {
              const token = chain.tokens.find((t: any) => t.address === e.target.value);
              setFromToken(token || null);
            }}
            className="w-full mt-3 rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10"
          >
            <option value="">Native ({chain.nativeSymbol})</option>
            {chain.tokens.map((t: any) => (
              <option key={t.address} value={t.address}>
                {t.symbol}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Amount"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          className="w-full mt-3 rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10"
        />
      </div>

      {/* TO */}
      <div className="bg-[#1d1f24] rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-2">To</p>

        <select
          value={toChainKey}
          onChange={(e) => handleToChainChange(e.target.value)}
          className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10"
        >
          <option value="">Select Chain</option>
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
          <option value="bsc">BNB Chain</option>
          <option value="sepolia">Sepolia</option>
        </select>

        {chain?.tokens?.length > 0 && (
          <select
            value={toToken?.address || ""}
            onChange={(e) => {
              const token = chain.tokens.find((t: any) => t.address === e.target.value);
              setToToken(token || null);
            }}
            className="w-full mt-3 rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10"
          >
            <option value="">Native ({chain.nativeSymbol})</option>
            {chain.tokens.map((t: any) => (
              <option key={t.address} value={t.address}>
                {t.symbol}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="You receive"
          value={toAmount}
          readOnly
          className="w-full mt-3 rounded-md bg-[#151928] px-4 py-3 text-sm text-gray-300 border border-white/10"
        />
      </div>

      {/* Swap Button */}
      <button
        disabled={!fromAmount || !fromToken || !toToken}
        className={`w-full rounded-md py-3 font-semibold transition ${
          !fromAmount || !fromToken || !toToken
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        Swap
      </button>
    </div>
  );
}
