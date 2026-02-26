import React, { useState } from "react";
import monexLogo from "../assets/monexLogo.png";
import { useNavigate } from "react-router-dom";
import { Copy, Home, Clock, Settings as SettingsIcon } from "lucide-react";
import useWalletMe from "../hooks/useWalletMe";
import Navbar from "../components/navbar";
import PageLayout from "../components/layouts/PageLayout";


export default function Settings() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    sessionStorage.clear();
    navigate("/");
  };

  const { address, loading } = useWalletMe();

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
      <div className="bg-[#1A1A1A] rounded-3xl p-6">
        <div className="flex items-center justify-between">
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
                  {loading
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
        </div>

        <div className="flex items-center gap-1 pt-5">
          {/* Circular arrow icon */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            title="Import wallet"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17L21 12L16 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M21 12H9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          {/* Unlock button */}
          <button
            onClick={handleLogout}
            className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            {loading ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
      <Navbar />
    </PageLayout>
  );
}
