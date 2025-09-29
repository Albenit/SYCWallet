import React, { useEffect, useState } from "react";
import coinAvatar from "../assets/svg/coinAvatar.svg";
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
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
              <img src={coinAvatar} alt="coin avatar" />
            </div>
            <button
              onClick={handleCopy}
              className="group flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-sm text-gray-200 hover:bg-white/10"
            >
              <span className="font-medium">
                {loading
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
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-3xl bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] hover:opacity-90 transition text-white font-semibold text-lg cursor-pointer my-10"
        >
          Logout
        </button>
      </div>
      <Navbar />
    </PageLayout>
  );
}
