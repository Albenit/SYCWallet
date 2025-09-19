import React, { useState, useEffect } from "react";
import useChain from "../../hooks/useChain";
import { ethers } from "ethers";
import ERC20_ABI from "../../abis/erc20.json";
import Swal from "sweetalert2";
import PasswordModal from "../partials/PasswordModal";

export default function SendTab() {
  const { chain, loading, error, fetchChain } = useChain();
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [errorTransaction, setErrorTransaction] = useState("");
  const [feeEstimate, setFeeEstimate] = useState<string | null>(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    const estimateFee = async () => {
      setFeeEstimate(null);
      if (!chain || !to || !amount) return;

      try {
        const provider = new ethers.JsonRpcProvider(chain.rpc);
        let fromAddress: string | undefined;

        let signer: ethers.Signer | null = null;
        if (typeof window !== "undefined" && (window as any).ethereum) {
          try {
            const injectedProvider = new ethers.BrowserProvider(
              (window as any).ethereum
            );
            signer = await injectedProvider.getSigner();
            fromAddress = await signer.getAddress();
          } catch {
            signer = null;
          }
        }

        if (selectedToken && selectedToken.address && selectedToken.decimals !== undefined) {
          const contract = new ethers.Contract(
            selectedToken.address,
            ERC20_ABI,
            signer || provider
          );
          const value = ethers.parseUnits(amount, selectedToken.decimals);

          let gasLimit;
          if (signer) {
            gasLimit = await contract.estimateGas.transfer(to, value);
          } else {
            const data = contract.interface.encodeFunctionData("transfer", [to, value]);
            gasLimit = await provider.estimateGas({
              to: selectedToken.address,
              from: fromAddress || to,
              data,
            });
          }

          const feeData = await provider.getFeeData();
          const gasPrice = feeData.gasPrice || 0n;
          const totalFee = gasLimit * gasPrice;
          setFeeEstimate(`${ethers.formatEther(totalFee)} ${chain.nativeSymbol}`);
        } else {
          const gasLimit = await provider.estimateGas({
            to,
            from: fromAddress,
            value: ethers.parseEther(amount),
          });
          const feeData = await provider.getFeeData();
          const gasPrice = feeData.gasPrice || 0n;
          const totalFee = gasLimit * gasPrice;
          setFeeEstimate(`${ethers.formatEther(totalFee)} ${chain.nativeSymbol}`);
        }
      } catch (err) {
        console.warn("Gas estimation failed:", err);
        setFeeEstimate("Unable to estimate fee");
      }
    };
    estimateFee();
  }, [to, amount, chain, selectedToken]);

  const handleClick = () => {
    if (!to || !amount || !chain) {
      setErrorTransaction("Enter address, amount, and select network");
      return;
    }
    setPasswordModalOpen(true);
  };

  const sendTransaction = async (password: string) => {
    try {
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) throw new Error("No wallet found");

      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const signer = wallet.connect(provider);

      let tx;
      if (selectedToken) {
        const contract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const value = ethers.parseUnits(amount, selectedToken.decimals);
        tx = await contract.transfer(to, value);
      } else {
        tx = await signer.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });
      }

      Swal.fire({
        title: "Transaction Sent",
        text: `Hash: ${tx.hash}`,
        icon: "success",
        confirmButtonText: "OK",
        background: "#02010C",
        color: "#ffffff",
      });

      setPasswordModalOpen(false);
      setAmount("");
      setTo("");
    } catch (err: any) {
      console.error("Send failed:", err);
      let userMessage = "Something went wrong. Please try again.";
      if (err.code === "INSUFFICIENT_FUNDS") {
        userMessage = "Insufficient funds to complete this transaction.";
      } else if (err.code === "NETWORK_ERROR") {
        userMessage = "Network error. Please check your RPC.";
      } else if (err.code === "ACTION_REJECTED") {
        userMessage = "Transaction was rejected.";
      } else if (err.info?.error?.message?.includes("gas")) {
        userMessage = "Not enough balance to cover gas fees.";
      }

      Swal.fire({
        title: "Transaction Failed",
        text: userMessage,
        icon: "error",
        confirmButtonText: "Close",
        background: "#02010C",
        color: "#ffffff",
      });
    }
  };

  return (
    <div className="space-y-4">
      <select
        value={selectedKey}
        onChange={(e) => {
          const key = e.target.value;
          setSelectedKey(key);
          setSelectedToken(null);
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
        placeholder={`Amount in ${selectedToken ? selectedToken.symbol : chain?.nativeSymbol || "..."}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {errorTransaction && <p className="text-red-500 text-sm mt-2">{errorTransaction}</p>}

      {feeEstimate && (
        <p className="text-gray-300 text-sm">
          Estimated Gas Fee: <b>{feeEstimate}</b>
        </p>
      )}

      <button
        onClick={handleClick}
        className="w-full rounded-md py-3 font-semibold transition bg-blue-600 hover:bg-blue-700"
      >
        Send
      </button>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={sendTransaction}
      />
    </div>
  );
}
