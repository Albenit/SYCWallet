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

const handleSwap = async () => {
  try {
    if (!fromChain || !toChain)
      return Swal.fire("Missing network", "Please select both networks.", "warning");
    if (!fromToken || !toToken)
      return Swal.fire("Missing token", "Please select both tokens.", "warning");
    if (!fromAmount || Number(fromAmount) <= 0)
      return Swal.fire("Invalid amount", "Enter a valid amount to swap.", "warning");
    if (!fromToken?.changeNowTicker || !toToken?.changeNowTicker)
      return Swal.fire(
        "Unsupported asset",
        "ChangeNOW does not support one of the selected tokens on this network.",
        "warning"
      );
    if (quoteError)
      return Swal.fire(
        "Quote unavailable",
        quoteError?.message || "Please adjust your amount or choose a different pair.",
        "warning"
      );
    if (!d)
      return Swal.fire(
        "No quote",
        "Please fetch a fresh ChangeNOW quote before swapping.",
        "warning"
      );

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

    const payload = {
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

    const baseTx = { to: tx.to };
    if (tx.data) baseTx.data = tx.data;
    if (tx.value) baseTx.value = tx.value;

    const prepared = await prepareTx(fromChain.key, baseTx, wallet.address);

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
    console.error(err);
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

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* FROM */}
      <div className="bg-[#02080E8C] rounded-xl p-4 mb-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-400">From</p>
          {fromChain?.logo && <img src={fromChain.logo} alt="" width={15} height={15} />}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              setSelecting("from");
              setIsChainModalOpen(true);
            }}
          >
            <span>{fromChain?.label || "Select Network"}</span>
            <ChevronRight size={18} className="opacity-60" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fromToken?.logo && <img src={fromToken.logo} alt="" width={25} height={25} />}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (!fromChain) return Swal.fire("Select chain first", "", "info");
                setSelecting("from");
                setIsTokenModalOpen(true);
              }}
            >
              <span>{fromToken?.symbol?.toUpperCase() || "Select Token"}</span>
              <ChevronRight size={18} className="opacity-60" />
            </div>
          </div>
          <input
            type="number"
            placeholder="0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="w-24 text-right bg-transparent text-white text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* ⇅ */}
      <div className="flex justify-center -my-2 z-10 relative">
        <button
          className="bg-[#02080E8C] p-2 rounded-full border border-white/10 hover:bg-white/20 transition cursor-pointer"
          onClick={swapSides}
        >
          ⇅
        </button>
      </div>

      {/* TO */}
      <div className="bg-[#02080E8C] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-400">To</p>
          {toChain?.logo && <img src={toChain.logo} alt="" width={15} height={15} />}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              setSelecting("to");
              setIsChainModalOpen(true);
            }}
          >
            <span>{toChain?.label || "Select Network"}</span>
            <ChevronRight size={18} className="opacity-60" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {toToken?.logo && <img src={toToken.logo} alt="" width={25} height={25} />}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (!toChain) return Swal.fire("Select chain first", "", "info");
                setSelecting("to");
                setIsTokenModalOpen(true);
              }}
            >
              <span>{toToken?.symbol?.toUpperCase() || "Select Token"}</span>
              <ChevronRight size={18} className="opacity-60" />
            </div>
          </div>

          <input
            type="text"
            placeholder="0"
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
            className="w-24 text-right bg-transparent text-gray-400 text-sm focus:outline-none"
          />
        </div>
      </div>

        {quoteError && (
          <p className="text-xs text-red-400 text-right pr-1">
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
        className="w-full rounded-full py-3 transition bg-blue-600 hover:bg-blue-700 cursor-pointer font-[700]"
      >
        {swapping ? "Swapping..." : "Swap"}
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
