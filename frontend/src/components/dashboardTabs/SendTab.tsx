import React from "react";

export default function SendTab() {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Recipient Address"
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Amount in ETH"
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition">
        Send
      </button>
    </div>
  );
}
