import React, { useEffect, useState } from "react";
import coinAvatar from "../assets/svg/coinAvatar.svg";
import { useNavigate } from "react-router-dom";
import { Copy, Home, Clock, Settings as SettingsIcon, ArrowUpRight, Download } from "lucide-react";



export default function Settings() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.clear()
    sessionStorage.clear();
    navigate("/signup");
  };

    useEffect(() => {
      const token = localStorage.getItem("auth_token");
  
      const fetchData = async () => {
        try {
          // 1) Get address
          if (!address) {
            const res = await fetch("http://127.0.0.1:5000/api/wallet/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch address");
            const me = await res.json();
            setAddress(me.address);
          }
  
        } catch (e) {
          console.error(e);
          setBalance(null);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [ address]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full text-center border border-gray-700 bg-[#0A0A1A] space-y-6">
        <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
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
        {/* Export Keys (disabled input style) */}
        <div className="w-full">
          <input
            type="text"
            disabled
            value="Export Keys"
            className="w-full rounded-md bg-black/40 text-gray-400 px-4 py-3 text-sm border border-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] hover:opacity-90 transition text-white font-semibold text-lg"
        >
          Logout
        </button>

                  {/* bottom navbar */}
          <div className="mt-6 rounded-b-xl bg-gradient-to-t from-[#0A0F17] to-[#0A0A1A] px-6 py-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-300">
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
                <div  className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                  <Home size={18} />
                </div>
                <span>Home</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5">
                  <Clock size={18} />
                </div>
                <span>History</span>
              </div>

              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate("/settings")}>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5">
                  <SettingsIcon size={18} />
                </div>
                <span>Settings</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
