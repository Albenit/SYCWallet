import coinAvatar from "../assets/svg/coinAvatar.svg";
import networkBadge from "../assets/svg/networkBadge.svg";
import { Copy, ArrowUpRight } from "lucide-react";
import useWalletMe from "../hooks/useWalletMe";
import { useState } from "react";
import Navbar from "../components/Navbar";
import transectionIcon from "../assets/svg/transectionIcon.svg";
import PageLayout from "../components/layouts/PageLayout";

export default function History() {
  const [copied, setCopied] = useState(false);
  const { address, Addressloading } = useWalletMe();

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

  return (
    <PageLayout>
      {/* Header */}
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
              <Copy
                size={16}
                className="opacity-60 group-hover:opacity-100"
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 mt-8 mb-4">
        <span className="text-gray-300 font-medium">Transaction History</span>
      </div>

      <div className="px-6">
        <p className="text-sm text-gray-400 mb-3">February 6, 2025</p>
        <div className="grid grid-cols-3 items-center bg-white/5 rounded-lg px-4 py-3">
          {/* Left: action + time */}
          <div className="flex items-center gap-3">
            <ArrowUpRight className="text-gray-300" size={18} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Sent</span>
              <span className="text-xs text-gray-400">1:03 PM</span>
            </div>
          </div>

          {/* Middle: amount + USD */}
          <div className="text-right">
            <p className="text-sm font-medium">0.003</p>
            <p className="text-xs text-gray-400">$105.43</p>
          </div>

          {/* Right: token icon */}
          <div className="flex justify-end">
            <img src={transectionIcon} alt="token" className="h-6 w-6" />
          </div>
        </div>

      </div>

      <Navbar />
    </PageLayout>
  );
}
