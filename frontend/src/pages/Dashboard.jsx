import React, { useEffect, useState } from "react";
import {
  Copy,
  Home,
  Clock,
  Settings,
  ArrowUpRight,
  Download,
} from "lucide-react";
import QRCode from "react-qr-code"; // install: npm install react-qr-code
import networkBadge from "../assets/svg/networkBadge.svg";
import coinAvatar from "../assets/svg/coinAvatar.svg";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [tab, setTab] = useState("send"); // "send" or "receive"

  const chains = ["ethereum", "sepolia", "polygon", "bsc"];

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    const fetchAddress = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wallet/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch address");
        const me = await res.json();
        setAddress(me.address);
      } catch (e) {
        console.error(e);
      }
    };

    if (!address) fetchAddress();
  }, []);

  useEffect(() => {
    if (!address) return;

    const token = localStorage.getItem("auth_token");

    const fetchBalance = async () => {
      try {
        const balRes = await fetch(
          `http://127.0.0.1:5000/api/wallet/${selectedChain}/native-balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!balRes.ok) throw new Error("Failed to fetch balance");
        const data = await balRes.json();
        setBalance(data.balance);
      } catch (e) {
        console.error(e);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [selectedChain, address]);



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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-4 sm:p-8">
        <div className="w-full rounded-xl border border-white/10 bg-[#0A0A1A]/90 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          {/* header */}
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

            {/* chain selector */}
            <div className="flex items-center gap-2 text-sm text-gray-300 select-none">
              <img src={networkBadge} alt="network" />
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="bg-transparent text-white text-[14px] border border-white/20 rounded-md px-2 py-1"
              >
                {chains.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className="bg-[#0A0A1A] text-white"
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* balance */}
          <div className="px-6 pb-4 pt-6">
            <div className="flex items-center gap-2 text-3xl font-bold tracking-wide sm:text-4xl">
              {loading ? "$…" : balance !== null ? `${balance}` : "0.00"}
              <span className="-mb-1 text-sm text-gray-400 uppercase">
                {selectedChain}
              </span>
            </div>

            {/* toggle buttons */}
            <div className="mt-6 flex gap-6 justify-center">
              <button
                onClick={() => setTab("send")}
                className={`flex flex-col items-center gap-2 text-sm ${
                  tab === "send" ? "text-white" : "text-gray-400"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151928]">
                  <ArrowUpRight size={18} />
                </span>
                <span>Send</span>
                {tab === "send" && <div className="h-[2px] w-8 bg-blue-500" />}
              </button>
              <button
                onClick={() => setTab("receive")}
                className={`flex flex-col items-center gap-2 text-sm ${
                  tab === "receive" ? "text-white" : "text-gray-400"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151928]">
                  <Download size={18} />
                </span>
                <span>Receive</span>
                {tab === "receive" && (
                  <div className="h-[2px] w-8 bg-blue-500" />
                )}
              </button>
            </div>

            <div className="mt-8">
              {tab === "send" ? (
                // SEND VIEW
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount in ETH"
                    className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition">
                    Send
                  </button>
                </div>
              ) : (
                // RECEIVE VIEW
                <div className="flex flex-col items-center gap-4">
                  <QRCode value={address || "0x..."} size={160} bgColor="#0A0A1A" fgColor="#ffffff" />
                  <p className="text-sm text-gray-400">Your Address</p>
                  <div className="flex items-center gap-2 bg-[#151928] px-3 py-2 rounded-md">
                    <span className="text-xs break-all">{address || "0x..."}</span>
                    <button onClick={handleCopy}>
                      <Copy size={14} className="opacity-60 hover:opacity-100" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-6 my-2 h-px bg-white/10" />

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
                  <Settings size={18} />
                </div>
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
