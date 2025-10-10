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

  const firstRoute = d?.routes?.[0];

  const toAmount = String(
    firstRoute?.expectedBuyAmount ??
      firstRoute?.expectedBuyAmountMaxSlippage ??
      d?.estimatedAmount ??
      d?.result?.estimatedAmount ??
      ""
  );

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
      if (!firstRoute)
        return Swal.fire("No route", "SwapKit did not return a swap route.", "warning");


      setSwapping(true);

      const encryptedJson = localStorage.getItem("encryptedWallet");
      const password_enc = sessionStorage.getItem("c_aP");
      if (!encryptedJson || !password_enc) throw new Error("Wallet not found");
      const secret = env?.VITE_ENCRYPT_KEY;
      const bytes = CryptoJS.AES.decrypt(password_enc, secret);
      const password = bytes.toString(CryptoJS.enc.Utf8);
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      // 🪄 Ask backend to prepare SwapKit swap
      const res = await fetch(`${env.VITE_API_URL}/swapkit/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellAsset: fromToken,
          buyAsset: toToken,
          sellAmount: String(fromAmount),
          sourceAddress: wallet.address,
          destinationAddress: wallet.address,
          slippage: 1,
          fromChain: fromChain.key,
          toChain: toChain.key,
          routeIndex: 0,
          routeTag: firstRoute?.meta?.tags?.[0],
          quoteId: d?.quoteId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "SwapKit request failed");

      const tx = data?.tx || data?.route?.tx || data?.result?.tx;
      if (!tx?.to || !tx?.data) throw new Error("SwapKit did not return a valid transaction");

      const baseTx: any = { to: tx.to, data: tx.data };
      if (tx.value) baseTx.value = tx.value;
      const prepared = await prepareTx(fromChain.key, baseTx, wallet.address);
      const signed = await wallet.signTransaction(serializeTx(prepared));
      const sent = await broadcastTx(fromChain.key, signed);

      Swal.fire({
        title: "Swap submitted",
        text: `Tx hash: ${sent.hash}`,
        icon: "success",
        background: "#02010C",
        color: "#fff",
      });
      setFromAmount("");
    } catch (err: any) {
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
            value={loading ? "Loading..." : error ? "Error" : toAmount}
            readOnly
            className="w-24 text-right bg-transparent text-gray-400 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Swap button */}
      <button
        disabled={swapping}
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
