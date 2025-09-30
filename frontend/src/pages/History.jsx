import coinAvatar from "../assets/svg/coinAvatar.svg";
import { Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import useWalletMe from "../hooks/useWalletMe";
import useTxHistory from "../hooks/useTxHistory";
import { useState } from "react";
import Navbar from "../components/Navbar";
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
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
            <img src={coinAvatar} alt="coin avatar" />
          </div>
          <button
            onClick={handleCopy}
            className="group flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-sm text-gray-200 hover:bg-white/10"
          >
            <span className="font-medium">
              {Addressloading
                ? "Loading…"
                : address
                  ? address.slice(0, 6) + "…" + address.slice(-4)
                  : "No address"}
            </span>
            {copied ? (
              <span className="text-xs text-green-400">Copied!</span>
            ) : (
              <Copy size={16} className="opacity-60 group-hover:opacity-100 cursor-pointer"  />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 my-4">
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-1 py-2 rounded-l-md ${activeTab === "sent"
            ? " text-white"
            : " text-[#EFEFEF7A] cursor-pointer"
            }`}
        >
          Sent
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-1 py-2 rounded-r-md ${activeTab === "received"
            ? " text-white"
            : " text-[#EFEFEF7A] cursor-pointer"
            }`}
        >
          Received
        </button>
      </div>

      <div className="px-6 space-y-3 max-h-[400px] overflow-y-auto custom-scroll">
        <div className="flex justify-center">
          {loading && <span className="loader"></span>}
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && displayed.length === 0 && (
          <p className="text-gray-400 text-sm">
            {activeTab === "sent" ? "No sent transactions" : "No received transactions"}
          </p>
        )}

        {displayed.map((tx, idx) => (
          <div
            key={tx.hash || tx.transactionHash || idx}
            className="bg-white/2 p-3 rounded mb-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {activeTab === "sent" ? (
                    <ArrowUpRight
                      size={16}
                      className={"text-red-400"}
                    />
                ) : (
                    <ArrowDownLeft
                      size={16}
                      className={"text-green-400"}
                    />
                )}
                <span>{activeTab === "sent" ? "Sent" : "Received"}</span>
              </div>
              <span className="text-xs text-gray-400">
                {tx.chain?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                Hash: {(tx.hash || tx.transactionHash)?.slice(0, 12)}...
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tx.hash || tx.transactionHash || "");
                  }}
                  className="text-white-400 hover:text-blue-600 text-xs"
                >
                  <Copy size={16} className="opacity-60 group-hover:opacity-100 cursor-pointer" />
            
                </button>
              </p>

              <p>
                {tx.value} {tx.asset || "NATIVE"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Navbar />
    </PageLayout>
  );
}
