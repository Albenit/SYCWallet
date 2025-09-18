import React, { useState } from "react";

type Network = {
  name: string;
  rpc: string;
  chainId: number;
};

const NETWORKS: Network[] = [
  { name: "Ethereum Mainnet", rpc: "https://eth-mainnet.g.alchemy.com/v2/mQNmjelTm-Z6VYLptlHpH", chainId: 1 },
  { name: "Sepolia Testnet", rpc: "https://eth-sepolia.g.alchemy.com/v2/mQNmjelTm-Z6VYLptlHpH", chainId: 11155111 },
  { name: "Polygon", rpc: "https://polygon-mainnet.g.alchemy.com/v2/mQNmjelTm-Z6VYLptlHpH", chainId: 137 },
  { name: "BNB Smart Chain", rpc: "https://bnb-mainnet.g.alchemy.com/v2/mQNmjelTm-Z6VYLptlHpH", chainId: 56 },
];

type SendTabProps = {
  onSend: (to: string, amount: string, network: Network) => void;
};

export default function SendTab({ onSend }: SendTabProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>(NETWORKS[1]); // default Sepolia
  const [errorTrancsation, setErrorTrancsation] = useState("");

  const handleClick = () => {
    if (!to || !amount) {
      setErrorTrancsation("Enter address and amount");
      return;
    }
    onSend(to, amount, network);
  };

  return (
    <div className="space-y-4">
      <select
        value={network.chainId}
        onChange={(e) => {
          const selected = NETWORKS.find(n => n.chainId === Number(e.target.value));
          if (selected) setNetwork(selected);
        }}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {NETWORKS.map((n) => (
          <option key={n.chainId} value={n.chainId} className="bg-[#0A0A1A]">
            {n.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {errorTrancsation && (
        <p className="text-red-500 text-sm mt-2">{errorTrancsation}</p>
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
