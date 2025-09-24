import React, { useState } from "react";
import { ethers, Wallet } from "ethers";
import useChain from "../../hooks/useChain";
import Swal from "sweetalert2";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export default function SwapTab() {
  const { chain, fetchChain } = useChain();

  const [fromChainKey, setFromChainKey] = useState("");
  const [toChainKey, setToChainKey] = useState("");
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapping, setSwapping] = useState(false);

  const handleFromChainChange = (key: string) => {
    setFromChainKey(key);
    setFromToken(null);
    if (key) fetchChain(key);
  };

  const handleToChainChange = (key: string) => {
    setToChainKey(key);
    setToToken(null);
    if (key) fetchChain(key);
  };

  const handleSwap = async () => {
    try {
      if (!fromChainKey || !toChainKey || !fromToken || !toToken || !fromAmount) {
        Swal.fire({
          title: "Missing Information",
          text: "Please select both chains, tokens, and enter amount.",
          icon: "warning",
          confirmButtonText: "Close",
          background: "#02010C",
          color: "#ffffff",
        });
        return;
      }

      setSwapping(true);

      const privateKey = localStorage.getItem("privateKey");
      if (!privateKey) throw new Error("No wallet found. Please log in again.");

      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const signer = new Wallet(privateKey, provider);

      const decimals = fromToken?.decimals || 18;
      const amountInWei = ethers.parseUnits(fromAmount.toString(), decimals);

      const routerAddress = UNISWAP_V2_ROUTER.toLowerCase();
      const fromAddr = fromToken.address ? fromToken.address.toLowerCase() : ethers.ZeroAddress;
      const toAddr = toToken.address ? toToken.address.toLowerCase() : ethers.ZeroAddress;

      if (fromToken.address) {
        const erc20 = new ethers.Contract(fromAddr, ERC20_ABI, signer);
        const allowance = await erc20.allowance(await signer.getAddress(), routerAddress);
        if (allowance < amountInWei) {
          const approveTx = await erc20.approve(routerAddress, amountInWei);
          await approveTx.wait();
        }
      }

      // Router contract
      const router = new ethers.Contract(
        routerAddress,
        [
          "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory)"
        ],
        signer
      );

      const path = [fromAddr, toAddr];

      const tx = await router.swapExactTokensForTokens(
        amountInWei,
        path,
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      await tx.wait();

      Swal.fire({
        title: "Swap Successful",
        text: `Hash: ${tx.hash}`,
        icon: "success",
        confirmButtonText: "OK",
        background: "#02010C",
        color: "#ffffff",
      });

      setFromAmount("");
      setToAmount("");
    } catch (err: any) {
      console.error("Swap failed:", err);
      let userMessage = "Something went wrong. Please try again.";
      if (err.code === "INSUFFICIENT_FUNDS") {
        userMessage = "Insufficient funds to complete this swap.";
      } else if (err.code === "NETWORK_ERROR") {
        userMessage = "Network error. Please check your RPC.";
      } else if (err.code === "ACTION_REJECTED") {
        userMessage = "Transaction was rejected.";
      } else if (err.info?.error?.message?.includes("gas")) {
        userMessage = "Not enough balance to cover gas fees.";
      }

      Swal.fire({
        title: "Swap Failed",
        text: userMessage,
        icon: "error",
        confirmButtonText: "Close",
        background: "#02010C",
        color: "#ffffff",
      });
    } finally {
      setSwapping(false);
    }
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
        disabled={!fromAmount || !fromToken || !toToken || swapping}
        onClick={handleSwap}
        className={`w-full rounded-md py-3 font-semibold transition ${
          !fromAmount || !fromToken || !toToken || swapping
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        {swapping ? "Swapping..." : "Swap"}
      </button>
    </div>
  );
}
