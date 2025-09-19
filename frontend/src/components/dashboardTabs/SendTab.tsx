import React, { useState } from "react";
import useChain from "../../hooks/useChain";

type SendTabProps = {
  onSend: (to: string, amount: string, chain: any, token?: any) => void;
};

export default function SendTab({ onSend }: SendTabProps) {
  const { chain, loading, error, fetchChain } = useChain();
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [errorTransaction, setErrorTransaction] = useState("");

  const handleClick = () => {
    if (!to || !amount || !chain) {
      setErrorTransaction("Enter address, amount, and select network");
      return;
    }
    onSend(to, amount, chain, selectedToken);
  };

  return (
    <div className="space-y-4">
      {/* Network select */}
      <select
        value={selectedKey}
        onChange={(e) => {
          const key = e.target.value;
          setSelectedKey(key);
          setSelectedToken(null); // reset token when network changes
          if (key) fetchChain(key);
        }}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Network</option>
        <option value="ethereum">Ethereum</option>
        <option value="sepolia">Sepolia</option>
        <option value="polygon">Polygon</option>
        <option value="bsc">BNB Chain</option>
      </select>

      {loading && <p className="text-gray-400 text-sm">Loading chain…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Token select (only shown when chain has tokens) */}
      {chain?.tokens?.length > 0 && (
        <select
          value={selectedToken?.address || ""}
          onChange={(e) => {
            const token = chain.tokens.find((t: any) => t.address === e.target.value);
            setSelectedToken(token || null);
          }}
          className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Send Native Token ({chain.nativeSymbol})</option>
          {chain.tokens.map((t: any) => (
            <option key={t.address} value={t.address}>
              {t.symbol}
            </option>
          ))}
        </select>
      )}

      <input
        type="text"
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="number"
        placeholder={`Amount in ${
          selectedToken ? selectedToken.symbol : chain?.nativeSymbol || "..."
        }`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {errorTransaction && (
        <p className="text-red-500 text-sm mt-2">{errorTransaction}</p>
      )}

      <button
        onClick={handleClick}
        className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>
  );
}
