import { useState } from "react";
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
import ERC20_ABI from "../../abis/erc20.json";

// Vite env typing shim for TS
const env: any = (import.meta as any).env;


const ROUTERS: Record<string, string> = {
  ethereum: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", 
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", 
  bsc: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap
  avalanche: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // TraderJoe
  fantom: "0xF491e7B69E4244ad4002BC14e878a34207E38c29", // SpookySwap
  arbitrum: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506", // SushiSwap
  gnosis: "0x1C232F01118CB8B424793ae03F870aa7D0ac7f77", // Honeyswap
  base: "0x2626664c2603336E57B271c5C0b26F421741e481", // Uniswap Base
  zksync: "0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", // SyncSwap
  sepolia: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Testnet
};

// Minimal interface to query router's WETH address dynamically
const ROUTER_INFO_ABI = [
  "function WETH() view returns (address)",
];

async function getWrappedNative(chainKey: string): Promise<string> {
  const router = ROUTERS[chainKey];
  const rpc = env?.[`VITE_RPC_${chainKey.toUpperCase()}`];
  if (!router || !rpc) throw new Error(`Missing router/RPC for ${chainKey}`);
  const provider = new ethers.JsonRpcProvider(rpc);
  const iface = new ethers.Interface(ROUTER_INFO_ABI as any);
  const data = iface.encodeFunctionData("WETH", []);
  const ret = await provider.call({ to: router, data });
  const [weth] = (iface.decodeFunctionResult("WETH", ret) as unknown) as [string];
  return weth;
}

/* ---------------------------------------------------
   Uniswap-style ABI
--------------------------------------------------- */
const UNISWAP_V2_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)",
];

/* ---------------------------------------------------
   Utility: serialize BigInts for JSON
--------------------------------------------------- */
const serializeTx = (obj: any) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );

/* ===================================================
   MAIN COMPONENT
=================================================== */
export default function SwapTab() {
  const [fromChain, setFromChain] = useState<any>(null);
  const [toChain, setToChain] = useState<any>(null);
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [swapping, setSwapping] = useState(false);

  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);

  const { data, loading, error } = useSwapEstimate(
    fromToken?.symbol,
    toToken?.symbol,
    fromAmount,
    fromChain?.key,
    toChain?.key
  );

  const { prepareTx } = usePrepareTx();
  const { sendTransaction: broadcastTx } = useSendTransaction();

  const d: any = data as any;
  const toAmount = String(d?.estimatedAmount ?? d?.toAmount ?? d?.summary?.estimatedAmount ?? "");

  /* ---------------------------------------------------
     MAIN SWAP HANDLER
  --------------------------------------------------- */
  const handleSwap = async () => {
    try {
      if (!fromChain || !toChain)
        return Swal.fire("Missing network", "Please select both networks.", "warning");
      if (!fromToken || !toToken)
        return Swal.fire("Missing token", "Please select both tokens.", "warning");
      if (!fromAmount || Number(fromAmount) <= 0)
        return Swal.fire("Invalid amount", "Enter a valid amount to swap.", "warning");

      setSwapping(true);

      // decrypt wallet
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) throw new Error("No wallet found");
  const secret = env?.VITE_ENCRYPT_KEY;
      const password_enc = sessionStorage.getItem("c_aP");
      if (!password_enc) throw new Error("No encrypted password found");
      const bytes = CryptoJS.AES.decrypt(password_enc, secret);
      const password = bytes.toString(CryptoJS.enc.Utf8);
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      // cross-chain swap => Socket bridge
      if (fromChain.key !== toChain.key) {
        await handleCrossChainSwap(wallet);
        return;
      }

      // same-chain swap
      const chainKey = fromChain.key;
      const router = ROUTERS[chainKey];
      if (!router) throw new Error(`No router for ${fromChain.label}`);

      const isNativeIn = !fromToken?.address || fromToken?.native;
      const isNativeOut = !toToken?.address || toToken?.native;
      if (isNativeIn && isNativeOut) {
        throw new Error("Swapping native to native is not supported. Select a token.");
      }

      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals || 18);
      const minOut = 0n; // TODO: get from quote/allow slippage
      const deadline = Math.floor(Date.now() / 1000) + 600;

  const wrapped = await getWrappedNative(chainKey);

      const path: string[] = (() => {
        if (isNativeIn && !isNativeOut) return [wrapped, toToken.address];
        if (!isNativeIn && isNativeOut) return [fromToken.address, wrapped];
        return [fromToken.address, toToken.address];
      })();

      // 1) Approve if needed (ERC20 input)
      if (!isNativeIn) {
        const iface = new ethers.Interface(ERC20_ABI as any);
        const approveData = iface.encodeFunctionData("approve", [router, ethers.MaxUint256]);
        const preparedApprove = await prepareTx(chainKey, { to: fromToken.address, data: approveData }, wallet.address);
        const signedApprove = await wallet.signTransaction(serializeTx(preparedApprove));
        const approveRes = await broadcastTx(chainKey, signedApprove);
        // Optional UX: Notify approval
        await Swal.fire({
          title: "Approval sent",
          text: `Tx: ${approveRes.hash}`,
          icon: "info",
          background: "#02010C",
          color: "#fff",
          timer: 1800,
          showConfirmButton: false,
        });
      }

      // 2) Build router call
      const routerIface = new ethers.Interface(UNISWAP_V2_ROUTER_ABI as any);
      const fn = isNativeIn
        ? "swapExactETHForTokens"
        : isNativeOut
        ? "swapExactTokensForETH"
        : "swapExactTokensForTokens";

      const args = fn === "swapExactETHForTokens"
        ? [minOut, path, wallet.address, deadline]
        : [amountIn, minOut, path, wallet.address, deadline];

      const dataEncoded = routerIface.encodeFunctionData(fn, args);
  const baseTx: any = { to: router, data: dataEncoded };
  if (isNativeIn) baseTx.value = amountIn.toString(); // send native value as decimal string

      // 3) Prepare (gas/nonce/chainId) on backend then sign and broadcast
      const prepared = await prepareTx(chainKey, baseTx, wallet.address);
      const signed = await wallet.signTransaction(serializeTx(prepared));
      const sent = await broadcastTx(chainKey, signed);

      Swal.fire({
        title: "Swap submitted",
        text: `Transaction hash: ${sent.hash}`,
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

  /* ---------------------------------------------------
     CROSS-CHAIN (Socket.tech)
  --------------------------------------------------- */
  const handleCrossChainSwap = async (wallet: any) => {
    try {
      const res = await fetch("https://api-devnet.socket.tech/v2/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-KEY": env?.VITE_SOCKET_API_KEY,
        },
        body: JSON.stringify({
          fromChainId: fromChain.chainId,
          toChainId: toChain.chainId,
          fromTokenAddress: fromToken.address || (await getWrappedNative(fromChain.key)),
          toTokenAddress: toToken.address || (await getWrappedNative(toChain.key)),
          amount: ethers.parseUnits(fromAmount, fromToken.decimals || 18).toString(),
          userAddress: wallet.address,
        }),
      });

      const quote = await res.json();
      if (!quote.result?.tx) throw new Error("No route found via Socket");

      const tx = quote.result.tx;
      const provider = new ethers.JsonRpcProvider(env?.[`VITE_RPC_${fromChain.key.toUpperCase()}`]);
      const walletConn = wallet.connect(provider);
      const txHash = await walletConn.sendTransaction(tx);
      Swal.fire({
        title: "Bridge initiated",
        text: `Tx: ${txHash.hash}`,
        icon: "info",
        background: "#02010C",
        color: "#fff",
      });
    } catch (err) {
      console.error("Bridge failed", err);
      Swal.fire("Bridge failed", (err as any)?.message || "No route", "error");
    }
  };

  /* ---------------------------------------------------
     UI Helpers
  --------------------------------------------------- */
  const swapSides = () => {
    const tempC = fromChain;
    const tempT = fromToken;
    setFromChain(toChain);
    setFromToken(toToken);
    setToChain(tempC);
    setToToken(tempT);
  };

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* FROM */}
      <div className="bg-[#02080E8C] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-400">From</p>
          {fromChain?.logo && <img src={fromChain.logo} alt="" width={15} height={15} />}
          <div className="flex items-center cursor-pointer"
               onClick={() => { setSelecting("from"); setIsChainModalOpen(true); }}>
            <span>{fromChain?.label || "Select Network"}</span>
            <ChevronRight size={18} className="opacity-60" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fromToken?.logo && <img src={fromToken.logo} alt="" width={25} height={25} />}
            <div className="flex items-center cursor-pointer"
                 onClick={() => {
                   if (!fromChain) return Swal.fire("Select chain first", "", "info");
                   setSelecting("from");
                   setIsTokenModalOpen(true);
                 }}>
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
          onClick={swapSides}>
          ⇅
        </button>
      </div>

      {/* TO */}
      <div className="bg-[#02080E8C] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-400">To</p>
          {toChain?.logo && <img src={toChain.logo} alt="" width={15} height={15} />}
          <div className="flex items-center cursor-pointer"
               onClick={() => { setSelecting("to"); setIsChainModalOpen(true); }}>
            <span>{toChain?.label || "Select Network"}</span>
            <ChevronRight size={18} className="opacity-60" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {toToken?.logo && <img src={toToken.logo} alt="" width={25} height={25} />}
            <div className="flex items-center cursor-pointer"
                 onClick={() => {
                   if (!toChain) return Swal.fire("Select chain first", "", "info");
                   setSelecting("to");
                   setIsTokenModalOpen(true);
                 }}>
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
        className="w-full rounded-full py-3 transition bg-blue-600 hover:bg-blue-700 cursor-pointer font-[700]">
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
