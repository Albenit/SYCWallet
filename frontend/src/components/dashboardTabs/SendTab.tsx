import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import ERC20_ABI from "../../abis/erc20.json";
import PasswordModal from "../partials/PasswordModal";
import Row from "../partials/Row";
import useEstimateGas from "../../hooks/useEstimateGas";

interface SendTabProps {
  portfolio: any;
  portfolioLoading: boolean;
  portfolioError: string | null;
  refetchPortfolio: () => void;
}

export default function SendTab({
  portfolio,
  portfolioLoading,
  portfolioError,
  refetchPortfolio,
}: SendTabProps) {
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [errorTransaction, setErrorTransaction] = useState("");
  const token = localStorage.getItem("auth_token");

  const { estimateGas, feeEstimate } = useEstimateGas();

  // ===== Fee estimation with debounce =====
  useEffect(() => {
    if (!selectedToken || !to || !amount) return;

    if (parseFloat(amount) > parseFloat(selectedToken.balance || "0")) {
      setErrorTransaction("Not enough balance");
      return;
    }

    const handler = setTimeout(() => {
      estimateGas({
        chainKey: selectedToken.chainKey,
        to,
        from: selectedToken.userAddress,
        amount,
        token: selectedToken.type === "token" ? selectedToken.token : null,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [selectedToken, to, amount]);

  // ===== Send transaction =====
  const sendTransaction = async (password: string) => {
    try {
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) throw new Error("No wallet found");

      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      // transaction body
      const txData =
        selectedToken.type === "token"
          ? {
              to: selectedToken.token,
              data: new ethers.Interface(ERC20_ABI).encodeFunctionData("transfer", [
                to,
                ethers.parseUnits(amount, selectedToken.decimals || 18),
              ]),
            }
          : {
              to,
              value: ethers.parseEther(amount),
            };

      // 👉 ask backend to prepare (nonce, gas, fees, chainId)
      const prepareRes = await fetch(
        `http://127.0.0.1:5000/api/wallet/${selectedToken.chainKey}/prepareTx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ from: wallet.address, ...txData }),
        }
      );
      const prepared = await prepareRes.json();
      if (!prepareRes.ok) throw new Error(prepared.error);

      // merge prepared tx
      const fullTx = { ...txData, ...prepared };

      // sign properly
      const signedTx = await wallet.signTransaction(fullTx);

      // broadcast
      const res = await fetch(
        `http://127.0.0.1:5000/api/wallet/${selectedToken.chainKey}/sendTransaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ signedTx }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Swal.fire({
        title: "Transaction Sent",
        text: `Hash: ${data.hash}`,
        icon: "success",
        background: "#02010C",
        color: "#ffffff",
      });

      setPasswordModalOpen(false);
      setAmount("");
      setTo("");
      setSelectedToken(null);
      refetchPortfolio();
    } catch (err: any) {
      Swal.fire({
        title: "Transaction Failed",
        text: err.message || "Something went wrong",
        icon: "error",
        background: "#02010C",
        color: "#ffffff",
      });
    }
  };

  // ===== Balance check =====
  useEffect(() => {
    if (selectedToken && amount) {
      const userBalance = parseFloat(selectedToken.balance || "0");
      const enteredAmount = parseFloat(amount);

      if (enteredAmount > userBalance) {
        setErrorTransaction("Not enough balance");
      } else {
        setErrorTransaction("");
      }
    } else {
      setErrorTransaction("");
    }
  }, [amount, selectedToken]);

  return (
    <div className="space-y-4">
      {/* Step 1: Show portfolio tokens */}
      {!selectedToken && (
        <>
          {portfolioLoading && <p className="text-gray-400 text-sm">Loading portfolio…</p>}
          {portfolioError && <p className="text-red-500 text-sm">{portfolioError}</p>}

          <div className="space-y-3">
            {portfolio?.portfolio?.map((chain: any) =>
              chain.items?.map((item: any, idx: number) => (
                <div
                  key={`${chain.chain}-${idx}`}
                  className="px-4 rounded cursor-pointer hover:bg-white/10"
                  onClick={() =>
                    setSelectedToken({
                      ...item,
                      chainKey:
                        chain.key?.toLowerCase() || chain.chain.toLowerCase().replace(/\s+/g, "-"),
                      chainLabel: chain.chain,
                      type: item.type,
                      token: item.token,
                      decimals: item.decimals || 18,
                      chainNativeSymbol: chain.nativeSymbol,
                      balance: item?.balance ? parseFloat(item.balance).toFixed(4) : "0.0000",
                      userAddress: portfolio.address,
                      chainId: chain.chainId, // ✅ ensure chainId comes from backend CHAINS
                    })
                  }
                >
                  <Row
                    icon={
                      <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                        <svg viewBox="0 0 256 417" className="h-5 w-5" aria-hidden>
                          <polygon fill="#a3bffa" points="127.9,0 0,213.7 127.9,282.6 255.8,213.7" />
                          <polygon fill="#94a3b8" points="127.9,416.3 255.8,246.3 127.9,315.3 0,246.3" />
                        </svg>
                      </div>
                    }
                    chain={chain.chain}
                    symbol={item?.symbol || "UNKNOWN"}
                    priceUsd={item?.usdPrice ? item.usdPrice : "0.00"}
                    change={-2.32}
                    balance={item?.balance ? parseFloat(item.balance).toFixed(4) : "0.0000"}
                    usdValue={(item?.usdValue || 0).toFixed(3)}
                  />
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Step 2: Send form */}
      {selectedToken && (
        <>
          <div className="text-center rounded mb-4">
            <p className="text-xl font-semibold text-white-400">Send {selectedToken.symbol}</p>
            <p className="text-grey-400">on {selectedToken.chainLabel} Network</p>
          </div>

          <input
            type="text"
            placeholder="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder={`Amount in ${selectedToken.symbol}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errorTransaction && <p className="text-red-500 text-sm mb-0">{errorTransaction}</p>}

          <div className="flex justify-between items-center">
            <p className="text-sm">Balance: {selectedToken.balance}</p>
            {feeEstimate && (
              <p className="text-gray-300 text-sm">
                Fee: <b>{feeEstimate}</b>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedToken(null)}
              className="w-1/2 rounded-md py-3 font-semibold transition bg-gray-700 hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={() => setPasswordModalOpen(true)}
              disabled={!to || !amount || parseFloat(amount) > parseFloat(selectedToken?.balance || "0")}
              className={`w-1/2 rounded-md py-3 font-semibold transition 
              ${
                !to || !amount || parseFloat(amount) > parseFloat(selectedToken?.balance || "0")
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* Password modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={sendTransaction}
      />
    </div>
  );
}
