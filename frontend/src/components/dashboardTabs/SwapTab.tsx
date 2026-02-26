import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import SwapChainModal from "./partials/SwapChainModal";
import SwapTokenModal from "./partials/SwapTokenModal";
import useSwapEstimate from "../../hooks/useSwapEstimate";
import usePrepareTx from "../../hooks/usePrepareTx";
import useSendTransaction from "../../hooks/useSendTransaction";
import { sendTransactionError } from "../../utils/errorUtils";
import useCheckBalance from "../../hooks/useCheckBalance";
import useChangeNowSwap from "../../hooks/useChangeNowSwap";

const env: any = (import.meta as any).env;

const serializeTx = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export default function SwapTab() {
  const [fromChain, setFromChain] = useState<any>(null);
  const [toChain, setToChain] = useState<any>(null);
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [swapping, setSwapping] = useState(false);
  const [fromBalance, setFromBalance] = useState<any>(null);
  const [fromBalanceLoading, setFromBalanceLoading] = useState(false);
  const { checkBalance } = useCheckBalance();
  const { createSwap } = useChangeNowSwap();

  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);

  const { data, loading, error } = useSwapEstimate(
    fromToken,
    toToken,
    fromAmount,
    fromChain?.key,
    toChain?.key,
    walletAddress
  );

  const { prepareTx } = usePrepareTx();
  const { sendTransaction: broadcastTx } = useSendTransaction();

  const d: any = data as any;
  const quoteError: any = error as any;
  const rateId: string | undefined = d?.rateId;
  const estimatedAmount =
    d?.estimatedAmount ?? d?.amountOut ?? d?.result?.estimatedAmount ?? d?.toAmount ?? "";
  const toAmount =
    quoteError || estimatedAmount === undefined || estimatedAmount === null
      ? ""
      : String(estimatedAmount);

  const formatMinAmount = (value: any) => {
    if (value === null || value === undefined) return "";
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    if (num >= 1) {
      return num.toFixed(4).replace(/\.0+$/, "").replace(/0+$/, "").replace(/\.$/, "");
    }
    return num.toPrecision(3);
  };

  const formatBalanceDisplay = (value: string) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    if (num === 0) return "0";
    if (num >= 1) {
      return num.toFixed(4).replace(/\.0+$/, "").replace(/0+$/, "").replace(/\.$/, "");
    }
    return num
      .toPrecision(4)
      .replace(/\.0+$/, "")
      .replace(/0+e/, "e")
      .replace(/\.e/, "e")
      .replace(/0+$/, "")
      .replace(/\.$/, "");
  };

  useEffect(() => {
    const encryptedJson = localStorage.getItem("encryptedWallet");
    const password_enc = sessionStorage.getItem("c_aP");
    if (encryptedJson && password_enc) {
      try {
        const secret = env?.VITE_ENCRYPT_KEY;
        const bytes = CryptoJS.AES.decrypt(password_enc, secret);
        const password = bytes.toString(CryptoJS.enc.Utf8);
        ethers.Wallet.fromEncryptedJson(encryptedJson, password).then((wallet) =>
          setWalletAddress(wallet.address)
        );
      } catch (err) {
        console.warn("Wallet decryption failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadBalance = async () => {
      if (!walletAddress || !fromChain?.key || !fromToken) {
        setFromBalance(null);
        setFromBalanceLoading(false);
        return;
      }

      setFromBalanceLoading(true);
      try {
        const tokenPayload = fromToken.native || !fromToken.address
          ? null
          : {
              address: fromToken.address,
              decimals: fromToken.decimals,
              symbol: fromToken.symbol,
            };

  const result = await (checkBalance as any)(walletAddress, fromChain.key, tokenPayload);
        if (cancelled) return;

        setFromBalance({
          value: result?.balance ?? "0",
          raw: result?.rawBalance ?? result?.balance ?? "0",
          symbol: (
            result?.symbol ||
            fromToken?.symbol ||
            fromChain?.nativeSymbol ||
            ""
          ).toUpperCase(),
          decimals:
            result?.decimals ??
            fromToken?.decimals ??
            (fromToken?.native ? fromChain?.decimals ?? 18 : 18),
        });
      } catch (err) {
        if (!cancelled) {
          setFromBalance(null);
        }
      } finally {
        if (!cancelled) {
          setFromBalanceLoading(false);
        }
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, fromChain?.key, fromChain?.decimals, fromChain?.nativeSymbol, fromToken, checkBalance]);

  const handleSwap = async () => {
    try {
      if (!fromChain || !toChain)
        return Swal.fire("Missing network", "Please select both networks.", "warning");
      if (!fromToken || !toToken)
        return Swal.fire("Missing token", "Please select both tokens.", "warning");
      if (!fromAmount || Number(fromAmount) <= 0)
        return Swal.fire("Invalid amount", "Enter a valid amount to swap.", "warning");
      if (!fromToken?.changeNowTicker || !toToken?.changeNowTicker)
        return Swal.fire("Unsupported asset", "ChangeNOW does not support one of the selected tokens on this network.","warning");
      if (quoteError)
        return Swal.fire("Quote unavailable",quoteError?.message || "Please adjust your amount or choose a different pair.","warning");
      if (!d)
        return Swal.fire("No quote","Please fetch a fresh ChangeNOW quote before swapping.","warning");

      setSwapping(true);

      const encryptedJson = localStorage.getItem("encryptedWallet");
      const password_enc = sessionStorage.getItem("c_aP");
      if (!encryptedJson || !password_enc) throw new Error("Wallet not found");

      const secret = env?.VITE_ENCRYPT_KEY;
      const bytes = CryptoJS.AES.decrypt(password_enc, secret);
      const password = bytes.toString(CryptoJS.enc.Utf8);
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      const balanceData = await checkBalance(wallet.address, fromChain.key);
      const balanceInEth = parseFloat(balanceData.balance);
      const nativeSymbol = balanceData.symbol || "ETH";

      if (balanceInEth < 0.0005) {
        Swal.fire({
          title: "Insufficient Gas Balance",
          text: `You need at least ~0.0005 ${nativeSymbol} to cover gas fees.`,
          icon: "warning",
          background: "#02010C",
          color: "#fff",
        });
        setSwapping(false);
        return;
      }

      const payload: any = {
        sellAsset: fromToken,
        buyAsset: toToken,
        sellAmount: String(fromAmount),
        sourceAddress: wallet.address,
        destinationAddress: wallet.address,
        fromChain: fromChain.key,
        toChain: toChain.key,
      };

      if (rateId) {
        payload.rateId = String(rateId);
      }

      const data = await createSwap(payload);

      const tx = data?.tx || data?.route?.tx || data?.result?.tx;
      if (!tx?.to || (!tx?.data && !tx?.value))
        throw new Error("ChangeNOW did not return a sendable transaction");

  const baseTx: any = { to: tx.to };
      if (tx.data) baseTx.data = tx.data;
      if (tx.value) baseTx.value = tx.value;

      const preparedResponse = await prepareTx(fromChain.key, baseTx, wallet.address);
      const meta = preparedResponse?.meta;

      if (meta?.hasEnoughForEstimated === false) {
        const shortfall = meta.shortfallEstimated;
        await Swal.fire({
          title: "Insufficient Gas Balance",
          text: shortfall
            ? `You are short by about ${shortfall} ${meta.symbol} to cover gas for this swap.`
            : "Not enough native balance to cover gas for this swap.",
          icon: "warning",
          background: "#02010C",
          color: "#fff",
        });
        setSwapping(false);
        return;
      }

      if (meta?.warning) {
        await Swal.fire({
          title: "Low Gas Buffer",
          text: meta.warning.message,
          icon: "info",
          background: "#02010C",
          color: "#fff",
        });
      }

      const prepared = preparedResponse?.tx || preparedResponse;

      // 🔧 Flatten BigNumber value for signing
      if (prepared.value && typeof prepared.value === "object" && "hex" in prepared.value) {
        prepared.value = prepared.value.hex;
      }

      const signed = await wallet.signTransaction(serializeTx(prepared));
      const sent = await broadcastTx(fromChain.key, signed);

      const changeNowId = data?.id || data?.transaction?.id || data?.result?.id;
      Swal.fire({
        title: "Swap submitted",
        html: `ChangeNOW ID: <b>${changeNowId || "pending"}</b><br/>Tx hash: ${sent.hash}`,
        icon: "success",
        background: "#02010C",
        color: "#fff",
      });

      setFromAmount("");
    } catch (err) {
      // console.error(err);
      Swal.fire({
        title: "Swap failed",
        text: sendTransactionError(err),
        icon: "error",
        background: "#02010C",
        color: "#fff",
      });
    } finally {
      setSwapping(false);
    }
  };

  const swapSides = () => {
    const tempC = fromChain;
    const tempT = fromToken;
    setFromChain(toChain);
    setFromToken(toToken);
    setToChain(tempC);
    setToToken(tempT);
  };

  const handleFillMax = () => {
    if (!fromBalance?.value) return;
    setFromAmount(fromBalance.value);
  };

  return (
    <div className="space-y-3  mx-auto">
      {/* FROM Card */}
      <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
        {/* Chain selector row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-[#767676]">From</span>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] transition-colors px-3 py-1.5 rounded-full text-xs text-gray-300 cursor-pointer"
            onClick={() => {
              setSelecting("from");
              setIsChainModalOpen(true);
            }}
          >
            {fromChain?.logo && <img src={fromChain.logo} alt="" className="w-4 h-4 rounded-full" />}
            <span>{fromChain?.label || "Select Network"}</span>
            <ChevronRight size={14} className="opacity-50" />
          </button>
        </div>

        {/* Token + Amount row */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] transition-colors pl-2 pr-3 py-2 rounded-full cursor-pointer shrink-0"
            onClick={() => {
              if (!fromChain) return Swal.fire("Select chain first", "", "info");
              setSelecting("from");
              setIsTokenModalOpen(true);
            }}
          >
            {fromToken?.logo ? (
              <img src={fromToken.logo} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-gray-500">?</span>
            )}
            <span className="text-sm font-medium text-white">{fromToken?.symbol?.toUpperCase() || "Token"}</span>
            <ChevronRight size={14} className="opacity-50 text-gray-400" />
          </button>

          <div className="relative flex-1 min-w-0">
            <input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="w-full pr-12 text-right bg-transparent text-white text-lg font-semibold focus:outline-none
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={handleFillMax}
              disabled={fromBalanceLoading || !fromBalance || Number(fromBalance.value) <= 0}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold text-[#DE0072] bg-[#DE0072]/10 rounded-md cursor-pointer hover:bg-[#DE0072]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="flex justify-end mt-2">
          <p className="text-[11px] text-[#767676]">
            {fromBalanceLoading
              ? "Balance: ..."
              : fromBalance
              ? `${formatBalanceDisplay(fromBalance.value)} ${fromBalance.symbol}`
              : fromToken
              ? `Balance: 0 ${fromToken.symbol?.toUpperCase() || ""}`
              : ""}
          </p>
        </div>
      </div>

      {/* Swap direction button */}
      <div className="flex justify-center -my-5 z-10 relative">
        <button
          type="button"
          className="h-9 w-9 flex items-center justify-center rounded-full bg-[#1A1A1A] border-4 border-[#0A0A0A] hover:bg-[#DE0072]/20 hover:border-[#DE0072]/30 transition-all cursor-pointer group"
          onClick={swapSides}
        >
          <span className="text-base leading-none group-hover:text-[#DE0072] transition-colors">⇅</span>
        </button>
      </div>

      {/* TO Card */}
      <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
        {/* Chain selector row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-[#767676]">To</span>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] transition-colors px-3 py-1.5 rounded-full text-xs text-gray-300 cursor-pointer"
            onClick={() => {
              setSelecting("to");
              setIsChainModalOpen(true);
            }}
          >
            {toChain?.logo && <img src={toChain.logo} alt="" className="w-4 h-4 rounded-full" />}
            <span>{toChain?.label || "Select Network"}</span>
            <ChevronRight size={14} className="opacity-50" />
          </button>
        </div>

        {/* Token + Amount row */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] transition-colors pl-2 pr-3 py-2 rounded-full cursor-pointer shrink-0"
            onClick={() => {
              if (!toChain) return Swal.fire("Select chain first", "", "info");
              setSelecting("to");
              setIsTokenModalOpen(true);
            }}
          >
            {toToken?.logo ? (
              <img src={toToken.logo} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-gray-500">?</span>
            )}
            <span className="text-sm font-medium text-white">{toToken?.symbol?.toUpperCase() || "Token"}</span>
            <ChevronRight size={14} className="opacity-50 text-gray-400" />
          </button>

          <input
            type="text"
            placeholder="0.00"
            value={
              loading
                ? "Loading..."
                : quoteError?.code === "deposit_too_small" && quoteError?.minAmount
                ? `Min ${formatMinAmount(quoteError.minAmount)}`
                : quoteError
                ? "Unavailable"
                : toAmount
            }
            readOnly
            className="flex-1 min-w-0 text-right bg-transparent text-gray-400 text-lg font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Quote error */}
      {quoteError && (
        <p className="text-xs text-red-400 text-right px-1">
          {quoteError.code === "deposit_too_small" && quoteError.minAmount
            ? `Amount too low. Minimum is ${formatMinAmount(quoteError.minAmount)} ${
                fromToken?.symbol?.toUpperCase() || ""
              }`
            : quoteError.message || "Quote unavailable for this pair."}
        </p>
      )}

      {/* Swap button */}
      <button
        disabled={swapping || loading || !d || Boolean(quoteError)}
        onClick={handleSwap}
        className={`
          w-full rounded-2xl py-3.5 text-sm font-bold tracking-wide transition-all 
          ${swapping || loading || !d || Boolean(quoteError)
            ? "bg-[#DE0072] text-white cursor-not-allowed"
            : "bg-gradient-to-r from-[#DE0072] to-[#A0005A] hover:from-[#FF0080] hover:to-[#C00068] text-white shadow-lg shadow-[#DE0072]/20 cursor-pointer"
          }
        `}
      >
        {swapping ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Swapping...
          </span>
        ) : (
          "Swap"
        )}
      </button>

      {/* Modals */}
      <SwapChainModal
        isOpen={isChainModalOpen}
        onClose={() => setIsChainModalOpen(false)}
        onSelect={(chain: any) => {
          if (selecting === "from") {
            setFromChain(chain);
            setFromToken(null);
          }
          if (selecting === "to") {
            setToChain(chain);
            setToToken(null);
          }
        }}
      />
      <SwapTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        chainKey={selecting === "from" ? fromChain?.key : toChain?.key}
        onSelect={(token: any) => {
          if (selecting === "from") setFromToken(token);
          if (selecting === "to") setToToken(token);
        }}
      />
    </div>
  );
}
