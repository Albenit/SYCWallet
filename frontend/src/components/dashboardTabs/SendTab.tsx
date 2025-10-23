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

export default function SendTab({portfolio,portfolioLoading,portfolioError,refetchPortfolio,}: SendTabProps) {
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [errorTransaction, setErrorTransaction] = useState("");
  const [gasQuote, setGasQuote] = useState<any>(null);
  const [gasWarning, setGasWarning] = useState<any>(null);
  const [gasErrorMessage, setGasErrorMessage] = useState("");

  const { prepareTx } = usePrepareTx();
  const { sendTransaction: broadcastTx } = useSendTransaction();
  const { estimateGas, loading: gasLoading } = useEstimateGas();

  const formatAmount = (value?: string | number | null) => {
    if (value === undefined || value === null) return "0";
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    if (num === 0) return "0";
    if (num >= 1) return num.toFixed(4).replace(/\.0+$/, "").replace(/0+$/, "").replace(/\.$/, "");
    return num
      .toPrecision(4)
      .replace(/\.0+$/, "")
      .replace(/0+e/, "e")
      .replace(/\.e/, "e")
      .replace(/0+$/, "")
      .replace(/\.$/, "");
  };

  const getNumericBalance = (token: any) => {
    const parsed = parseFloat(token?.rawBalance ?? token?.balance ?? "0");
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    const recipient = to.trim();
    const amountValue = amount.trim();

    if (!selectedToken || !recipient || !amountValue) {
      setGasQuote(null);
      setGasWarning(null);
      setGasErrorMessage("");
      return;
    }

    if (parseFloat(amountValue) > getNumericBalance(selectedToken)) {
      setGasQuote(null);
      setGasWarning(null);
      setGasErrorMessage("");
      return;
    }

    let cancelled = false;
    setGasErrorMessage("");
    const handler = setTimeout(async () => {
      try {
        const quote = await estimateGas({
          chainKey: selectedToken.chainKey,
          to: recipient,
          from: selectedToken.userAddress,
          amount: amountValue,
          token: selectedToken.type === "token" ? selectedToken.token : null,
          decimals: selectedToken.decimals,
        });
        if (cancelled) return;
        setGasQuote(quote);
        setGasWarning(quote?.warning || null);
      } catch (err: any) {
        if (cancelled) return;
        setGasQuote(null);
        setGasWarning(null);
        const shortfall = err?.shortfall || err?.details?.shortfall || err?.shortfallEstimated;
        const required = err?.required || err?.details?.required;
        const available = err?.available || err?.details?.available;
        if (shortfall && selectedToken?.chainNativeSymbol) {
          setGasErrorMessage(
            `You need about ${formatAmount(shortfall)} ${selectedToken.chainNativeSymbol} more for gas. Available ${formatAmount(available || "0")}.`
          );
        } else if (required && available && selectedToken?.chainNativeSymbol) {
          setGasErrorMessage(
            `Gas requires ~${formatAmount(required)} ${selectedToken.chainNativeSymbol}. Available ${formatAmount(available)}.`
          );
        } else {
          setGasErrorMessage(err?.message || "Failed to estimate gas");
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [selectedToken, to, amount, estimateGas]);

  const sendTransaction = async () => {
    try {
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) throw new Error("No wallet found");

      const secret = (import.meta as any).env.VITE_ENCRYPT_KEY;

      const password_enc = sessionStorage.getItem("c_aP");
      if (!password_enc) throw new Error("No encrypted password found");

      const bytes = CryptoJS.AES.decrypt(password_enc, secret);
      const password = bytes.toString(CryptoJS.enc.Utf8);
      if (!password) throw new Error("Decryption failed");

      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      const recipient = to.trim();

      if (!recipient) {
        Swal.fire({
          title: "Recipient Required",
          text: "Please enter a valid recipient address before sending.",
          icon: "warning",
          background: "#02010C",
          color: "#ffffff",
        });
        return;
      }

      const amountValue = amount.trim();

      const estimateParams = {
        chainKey: selectedToken.chainKey,
        to: recipient,
        from: selectedToken.userAddress,
        amount: amountValue,
        token: selectedToken.type === "token" ? selectedToken.token : null,
        decimals: selectedToken.decimals,
      };

      let currentQuote;
      try {
        currentQuote = await estimateGas(estimateParams);
        setGasQuote(currentQuote);
        setGasWarning(currentQuote?.warning || null);
        setGasErrorMessage("");
      } catch (err: any) {
        Swal.fire({
          title: "Gas Estimation Failed",
          text: err?.message || "Unable to estimate gas fees for this transaction.",
          icon: "error",
          background: "#02010C",
          color: "#ffffff",
        });
        return;
      }

      if (!currentQuote?.hasEnoughForEstimated) {
        const shortfall = currentQuote?.shortfallEstimated;
        Swal.fire({
          title: "Insufficient Gas Balance",
          text: shortfall
            ? `You are short by ~${formatAmount(shortfall)} ${currentQuote.symbol}.`
            : "You don’t have enough native balance to cover gas fees.",
          icon: "warning",
          background: "#02010C",
          color: "#ffffff",
        });
        return;
      }

  const estimatedFee = parseFloat(currentQuote?.estimatedFeeNative || "0");
  const nativeBalance = parseFloat(currentQuote?.nativeBalance || "0");
  const enteredAmount = parseFloat(amountValue || "0");
      const nativeSymbol = currentQuote?.symbol || selectedToken.chainNativeSymbol || selectedToken.symbol;
  const tokenDecimals = selectedToken.decimals || 18;
  let tokenAmountWei: bigint | null = null;

      if (selectedToken.type !== "token") {
        const totalNeeded = enteredAmount + estimatedFee;
        if (totalNeeded > nativeBalance) {
          await Swal.fire({
            title: "Insufficient Balance",
            text: `You need roughly ${formatAmount(totalNeeded)} ${nativeSymbol} (amount + estimated gas). Available: ${formatAmount(nativeBalance)} ${nativeSymbol}.`,
            icon: "warning",
            background: "#02010C",
            color: "#ffffff",
          });
          return;
        }
      } else {
        try {
          tokenAmountWei = ethers.parseUnits(amountValue, tokenDecimals);
        } catch (parseErr) {
          await Swal.fire({
            title: "Invalid Amount",
            text: "The amount has more decimal places than this token allows.",
            icon: "warning",
            background: "#02010C",
            color: "#ffffff",
          });
          return;
        }

        if (selectedToken.balanceWei) {
          const balanceWei = BigInt(selectedToken.balanceWei);
          if (tokenAmountWei > balanceWei) {
            const availableDisplay = formatAmount(ethers.formatUnits(balanceWei, tokenDecimals));
            await Swal.fire({
              title: "Not Enough Token Balance",
              text: `You are trying to send ${formatAmount(amountValue)} ${selectedToken.symbol} but only have ${availableDisplay} available.`,
              icon: "warning",
              background: "#02010C",
              color: "#ffffff",
            });
            return;
          }
        } else {
          const tokenBalance = getNumericBalance(selectedToken);
          if (enteredAmount > tokenBalance) {
            await Swal.fire({
              title: "Not Enough Token Balance",
              text: `You are trying to send ${formatAmount(amountValue)} ${selectedToken.symbol} but only have ${formatAmount(tokenBalance)} available.`,
              icon: "warning",
              background: "#02010C",
              color: "#ffffff",
            });
            return;
          }
        }
        if (estimatedFee > 0 && nativeBalance < estimatedFee) {
          await Swal.fire({
            title: "Insufficient Gas Funds",
            text: `You need roughly ${formatAmount(estimatedFee)} ${nativeSymbol} for gas. Available: ${formatAmount(nativeBalance)} ${nativeSymbol}.`,
            icon: "warning",
            background: "#02010C",
            color: "#ffffff",
          });
          return;
        }
      }

      const txData =
        selectedToken.type === "token"
          ? {
              to: selectedToken.token,
              data: new ethers.Interface(ERC20_ABI).encodeFunctionData(
                "transfer",
                [recipient, tokenAmountWei ?? ethers.parseUnits(amountValue, tokenDecimals)]
              ),
            }
          : {
              to: recipient,
              value: ethers.parseEther(amountValue),
            };

      const preparedResponse = await prepareTx(selectedToken.chainKey, txData, wallet.address);
      if (preparedResponse?.meta) {
        setGasQuote(preparedResponse.meta);
        setGasWarning(preparedResponse.meta.warning || null);
        setGasErrorMessage("");
        if (preparedResponse.meta.hasEnoughForEstimated === false) {
          const shortfall = preparedResponse.meta.shortfallEstimated;
          Swal.fire({
            title: "Gas Balance Too Low",
            text: shortfall
              ? `After recalculating, you still need about ${formatAmount(shortfall)} ${preparedResponse.meta.symbol} more for gas.`
              : "After recalculating fees, there isn’t enough native balance to cover gas.",
            icon: "warning",
            background: "#02010C",
            color: "#ffffff",
          });
          return;
        }
      }
      const preparedTx = preparedResponse?.tx || preparedResponse;

      const normalizeTx = (tx: any) => {
        const normalized: any = { ...tx };
        for (const key in normalized) {
          const val = normalized[key];
          if (val && typeof val === "object" && "hex" in val) {
            normalized[key] = val.hex;
          }
        }
        return normalized;
      };

      const transaction = normalizeTx({ ...txData, ...preparedTx });

      const signedTx = await wallet.signTransaction(transaction);
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
      setGasQuote(null);
      setGasWarning(null);
      setGasErrorMessage("");
      refetchPortfolio();
    } catch (err: any) {
      console.error("Transaction error:", err);

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
      const userBalance = getNumericBalance(selectedToken);
      const enteredAmount = parseFloat(amount.trim());

      if (Number.isFinite(enteredAmount) && enteredAmount > userBalance) {
        setErrorTransaction("Not enough balance");
      } else {
        setErrorTransaction("");
      }
    } else {
      setErrorTransaction("");
    }
  }, [amount, selectedToken]);

  const handleSendClick = () => {
    const amountValue = amount.trim();

    if (!to.trim() || !amountValue) {
      setErrorTransaction("Both recipient address and amount are required");
      return;
    }
    if (Number(amountValue) <= 0) {
      setErrorTransaction("Amount must be greater than zero");
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
            portfolio.portfolio.map((chain: any) => {
              const nonZeroItems = chain.items.filter(
                (item: any) => parseFloat(item.balance) > 0
              );

              return nonZeroItems.length > 0 ? (
                nonZeroItems.map((item: any, idx: number) => (
                  <div
                    key={`${chain.chain}-${idx}`}
                    className="px-2 rounded cursor-pointer hover:bg-white/2"
                    onClick={() =>
                      setSelectedToken(() => {
                        const decimals = item.decimals || 18;
                        let balanceWei = null;
                        try {
                          balanceWei = ethers.parseUnits(String(item.balance ?? "0"), decimals).toString();
                        } catch (parseErr) {
                          console.warn("Failed to parse token balance", parseErr);
                        }

                        return {
                          ...item,
                          chainKey:
                            chainKeyMap[chain.chain] ||
                            chain.chain.toLowerCase().replace(/\s+/g, "-"),
                          chainLabel: chain.chain,
                          type: item.type,
                          token: item.token,
                          decimals,
                          chainNativeSymbol: chain.nativeSymbol,
                          balance: parseFloat(item.balance).toFixed(4),
                          rawBalance: item.balance,
                          balanceWei,
                          userAddress: portfolio.address,
                          chainId: chain.chainId,
                        };
                      })
                    }
                  >
                    <Row
                      icon={item.logo}
                      chain={chain.chain}
                      symbol={item.symbol || "UNKNOWN"}
                      balance={parseFloat(item.balance).toFixed(4)}
                      usdValue={item.usdValue ?? null}
                    />
                  </div>
                ))
              ) : (
                <div
                  key={chain.chain}
                  className="px-6 text-center text-gray-400 text-sm"
                >
                  No assets with balance.
                </div>
              );
            })
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
              onClick={() => setAmount((selectedToken.rawBalance ?? selectedToken.balance) || "0")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white cursor-pointer"
            >
              MAX
            </button>
          </div>

          {errorTransaction && (
            <p className="text-red-500 text-sm mb-0">{errorTransaction}</p>
          )}

          <div className="flex justify-between items-start gap-4">
            <p className="text-sm text-[#EFEFEF7A]">
              Balance: {formatAmount(selectedToken.rawBalance ?? selectedToken.balance)} {selectedToken.symbol}
            </p>
            <div className="text-right">
              {gasLoading && <p className="text-[#EFEFEF7A] text-sm">Estimating…</p>}
              {gasQuote && !gasLoading && (
                <div className="text-[#EFEFEF7A] text-sm">
                  <p>
                    Fee (est): <b>{formatAmount(gasQuote.estimatedFeeNative)} {gasQuote.symbol}</b>
                  </p>
                  <p className="text-xs text-[#EFEFEF7A]">
                    Max (buffered): {formatAmount(gasQuote.maxFeeNative)} {gasQuote.symbol}
                  </p>
                  <p className="text-xs text-[#EFEFEF7A]">
                    Native balance: {formatAmount(gasQuote.nativeBalance)} {gasQuote.symbol}
                  </p>
                  <p className="text-xs text-[#EFEFEF7A]">
                    Base fee: {formatAmount(gasQuote.baseFeePerGasGwei)} gwei
                  </p>
                  <p className="text-xs text-[#EFEFEF7A]">
                    Max fee per gas: {formatAmount(gasQuote.maxFeePerGasGwei)} gwei
                  </p>
                  <p className="text-xs text-[#EFEFEF7A]">
                    Priority fee: {formatAmount(gasQuote.maxPriorityFeePerGasGwei)} gwei
                  </p>
                </div>
              )}
              {gasErrorMessage && !gasLoading && (
                <p className="text-red-400 text-xs">{gasErrorMessage}</p>
              )}
              {gasWarning && !gasLoading && !gasErrorMessage && (
                <p className="text-amber-300 text-xs">{gasWarning.message}</p>
              )}
            </div>
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
