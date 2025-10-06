import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import ERC20_ABI from "../../abis/erc20.json";
import Row from "../partials/Row";
import useEstimateGas from "../../hooks/useEstimateGas";
import usePrepareTx from "../../hooks/usePrepareTx";
import useSendTransaction from "../../hooks/useSendTransaction";
import { chainKeyMap } from "../../utils/chainKeyMap";
import { sendTransactionError } from "../../utils/errorUtils";
import CryptoJS from "crypto-js";

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
  const [errorTransaction, setErrorTransaction] = useState("");

  const { prepareTx } = usePrepareTx();
  const { sendTransaction: broadcastTx } = useSendTransaction();
  const { estimateGas, feeEstimate } = useEstimateGas();

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
        decimals: selectedToken.decimals,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [selectedToken, to, amount]);

  const sendTransaction = async () => {
    try {
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) throw new Error("No wallet found");

      const secret = import.meta.env.VITE_ENCRYPT_KEY;

      const password_enc = sessionStorage.getItem("c_aP");

      if (!password_enc) throw new Error("No encrypted password found");

      const bytes = CryptoJS.AES.decrypt(password_enc, secret);
      const password = bytes.toString(CryptoJS.enc.Utf8);

      if (!password) throw new Error("Decryption failed");

      const wallet = await ethers.Wallet.fromEncryptedJson(
        encryptedJson,
        password
      );

      const txData =
        selectedToken.type === "token"
          ? {
              to: selectedToken.token,
              data: new ethers.Interface(ERC20_ABI).encodeFunctionData(
                "transfer",
                [to, ethers.parseUnits(amount, selectedToken.decimals || 18)]
              ),
            }
          : {
              to,
              value: ethers.parseEther(amount),
            };

      const prepared = await prepareTx(
        selectedToken.chainKey,
        txData,
        wallet.address
      );

      const fullTx = { ...txData, ...prepared };

      const signedTx = await wallet.signTransaction(fullTx);

      const data = await broadcastTx(selectedToken.chainKey, signedTx);

      Swal.fire({
        title: "Transaction Sent",
        text: `Hash: ${data.hash}`,
        icon: "success",
        background: "#02010C",
        color: "#ffffff",
      });

      setAmount("");
      setTo("");
      setSelectedToken(null);
      refetchPortfolio();
    } catch (err: any) {
      Swal.fire({
        title: "Transaction Failed",
        text: sendTransactionError(err),
        icon: "error",
        background: "#02010C",
        color: "#ffffff",
      });
    }
  };

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

  const handleSendClick = () => {
    if (!to || !amount) {
      setErrorTransaction("Both recipient address and amount are required");
      return;
    }
    sendTransaction();
  };

  return (
    <div className="space-y-4">
      {!selectedToken && (
        <>
          {portfolioLoading && (
            <p className="text-gray-400 text-sm">Loading portfolio…</p>
          )}
          {portfolioError && (
            <p className="text-red-500 text-sm">{portfolioError}</p>
          )}
          {portfolio?.portfolio?.length > 0 ? (
            portfolio?.portfolio?.map((chain: any) =>
              chain.items
                ?.filter((item: any) => parseFloat(item.balance) > 0)
                .map((item: any, idx: number) => (
                  <div
                    key={`${chain.chain}-${idx}`}
                    className="px-2 rounded cursor-pointer hover:bg-white/2"
                    onClick={() =>
                      setSelectedToken({
                        ...item,
                        chainKey:
                          chainKeyMap[chain.chain] ||
                          chain.chain.toLowerCase().replace(/\s+/g, "-"),
                        chainLabel: chain.chain,
                        type: item.type,
                        token: item.token,
                        decimals: item.decimals || 18,
                        chainNativeSymbol: chain.nativeSymbol,
                        balance: parseFloat(item.balance).toFixed(4),
                        userAddress: portfolio.address,
                        chainId: chain.chainId,
                      })
                    }
                  >
                    <Row
                      icon={item?.logo}
                      chain={chain.chain}
                      symbol={item?.symbol || "UNKNOWN"}
                      balance={parseFloat(item.balance).toFixed(4)}
                    />
                  </div>
                ))
            )
          ) : (
            <div className="px-6 text-center text-gray-400 text-sm">
              No tokens added yet.
            </div>
          )}
        </>
      )}

      {/* Step 2: Send form */}
      {selectedToken && (
        <>
          <div className="text-center rounded mb-4">
            <p className="text-xl font-semibold text-white-400">
              Send {selectedToken.symbol}
            </p>
            <div className="flex justify-center my-2">
              <img src={selectedToken.logo} alt="" width={40} height={40} />
            </div>
            <p className="text-grey-400">
              on {selectedToken.chainLabel} Network
            </p>
          </div>

          <input
            type="text"
            placeholder="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-md bg-[#02080E8C] px-4 py-3 text-sm text-white text-[12px] focus:outline-none"
          />

          <div className="relative w-full mb-1">
            <input
              type="number"
              placeholder={`Amount in ${selectedToken.symbol}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md bg-[#02080E8C] px-4 py-3 pr-14 text-sm text-[12px] text-white focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setAmount(selectedToken.balance)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white cursor-pointer"
            >
              MAX
            </button>
          </div>

          {errorTransaction && (
            <p className="text-red-500 text-sm mb-0">{errorTransaction}</p>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-[#EFEFEF7A]">
              Balance: {selectedToken.balance}
            </p>
            {feeEstimate && (
              <p className="text-[#EFEFEF7A] text-sm">
                Fee: <b>{feeEstimate}</b>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendClick}
              className="w-full rounded-full py-3 transition bg-blue-600 hover:bg-blue-700 cursor-pointer font-[700]"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
