import monexLogo from "../assets/monexLogo.png";
import { Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import useWalletMe from "../hooks/useWalletMe";
import useTxHistory from "../hooks/useTxHistory";
import { useState } from "react";
import Navbar from "../components/navbar";
import PageLayout from "../components/layouts/PageLayout";

export default function History() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("sent");
  const { address, Addressloading } = useWalletMe();
  const { history, loading, error } = useTxHistory(address);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const sentTxs = history.filter(
    (tx) => tx.from?.toLowerCase() === address?.toLowerCase()
  );
  const receivedTxs = history.filter(
    (tx) => tx.to?.toLowerCase() === address?.toLowerCase()
  );

  const displayed = activeTab === "sent" ? sentTxs : receivedTxs;

  return (
    <PageLayout>
      <div className="bg-[#1A1A1A] rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center bg-[#121212] p-3 rounded-full">
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
              <img src={monexLogo} alt="coin avatar" className="h-6 w-7" />
            </div>
            <button
              onClick={handleCopy}
              className="group flex items-center gap-2 rounded-md px-3 py-1 text-sm text-gray-200"
            >
              <span className="flex flex-col items-start">
                <span className="text-[11px] text-[#DE0072] leading-tight">Your Wallet</span>
                <span className="font-medium">
                  {Addressloading
                    ? "Loading…"
                    : address
                      ? address.slice(0, 8) + "…." + address.slice(-6)
                      : "No address"}
                </span>
              </span>
              {copied ? (
                <span className="text-xs text-[#DE0072]">Copied!</span>
              ) : (
                <Copy
                  size={18}
                  color="#DE0072"
                  className="opacity-60 group-hover:opacity-100 cursor-pointer"
                />
              )}
            </button>
          </div>
          <div>
            <span className="text-[15px]">Transaction History</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 my-5 gap-2">
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === "sent"
                ? "bg-gradient-to-b from-[#DE0072]/20 to-[#DE0072]/5 text-white ring-1 ring-[#DE0072]/40 shadow-[0_0_12px_rgba(222,0,114,0.1)]"
                : "bg-[#121212] text-[#767676] hover:bg-[#1f1f1f] hover:text-gray-300"
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowUpRight size={14} />
              Sent
            </span>
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === "received"
                ? "bg-gradient-to-b from-[#DE0072]/20 to-[#DE0072]/5 text-white ring-1 ring-[#DE0072]/40 shadow-[0_0_12px_rgba(222,0,114,0.1)]"
                : "bg-[#121212] text-[#767676] hover:bg-[#1f1f1f] hover:text-gray-300"
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowDownLeft size={14} />
              Received
            </span>
          </button>
        </div>

        {/* Transaction list */}
        <div className="px-6 space-y-2 max-h-[400px] overflow-y-auto custom-scroll pb-4">
          {/* Loading */}
          <div className="flex justify-center">
            {loading && <span className="loader"></span>}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-12 w-12 rounded-full bg-[#121212] flex items-center justify-center">
                {activeTab === "sent" ? (
                  <ArrowUpRight size={20} className="text-[#767676]" />
                ) : (
                  <ArrowDownLeft size={20} className="text-[#767676]" />
                )}
              </div>
              <p className="text-[#767676] text-sm">
                {activeTab === "sent" ? "No sent transactions yet" : "No received transactions yet"}
              </p>
            </div>
          )}

          {/* Transaction cards */}
          {displayed.map((tx, idx) => (
            <div
              key={tx.hash || tx.transactionHash || idx}
              className="bg-[#121212] border border-white/5 rounded-2xl p-4 transition-colors hover:bg-[#161616]"
            >
              {/* Top row: type + chain badge */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${activeTab === "sent"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                      }`}
                  >
                    {activeTab === "sent" ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownLeft size={16} />
                    )}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {activeTab === "sent" ? "Sent" : "Received"}
                  </span>
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#1A1A1A] text-[#767676] px-2.5 py-1 rounded-full">
                  {tx.chain?.toUpperCase()}
                </span>
              </div>

              {/* Bottom row: hash + value */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#767676]">
                  <span className="font-mono">
                    {(tx.hash || tx.transactionHash)?.slice(0, 10)}…{(tx.hash || tx.transactionHash)?.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tx.hash || tx.transactionHash || "");
                    }}
                    className="hover:text-[#DE0072] transition-colors cursor-pointer"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                <p className="text-sm font-semibold text-white">
                  {tx.value} <span className="text-xs text-[#767676] font-normal">{tx.asset || "NATIVE"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Navbar />
    </PageLayout>
  );
}
