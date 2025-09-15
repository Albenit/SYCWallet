import React from "react";
import { Copy, Home, Clock, Settings, ArrowUpRight, Download, ChevronRight } from "lucide-react";
import networkBadge from "../assets/svg/networkBadge.svg"
import coinAvatar from "../assets/svg/coinAvatar.svg"



function Row({ icon, symbol, chain = "Ethereum", priceUsd, change, balance = 0 }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide">{symbol}</span>
            <span className="rounded bg-[#18212d] px-2 py-[2px] text-[11px] text-gray-300">{chain}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-300">
            <span>${priceUsd.toLocaleString()}</span>
            <span className={change < 0 ? "text-[#f87171]" : "text-[#22c55e]"}>{change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-semibold tracking-tight">{balance}</div>
        <div className="text-xs text-gray-400">$0.00</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-4 sm:p-8">
        <div className="w-full rounded-xl border border-white/10 bg-[#0A0A1A]/90 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          {/* header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
            <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                <img src={coinAvatar} />
            </div>
              <button className="group flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-sm text-gray-200 hover:bg-white/10">
                <span className="font-medium">0x4343A1…431</span>
                <Copy size={16} className="opacity-60 group-hover:opacity-100" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 select-none">
                <img src={networkBadge}/>
                <span className="text-[14px]">Etherum Mainnet</span>
            </div>
          </div>

          {/* balance + actions */}
          <div className="px-6 pb-4 pt-6">
            <div className="flex items-center gap-2 text-3xl font-bold tracking-wide sm:text-4xl">$0.00
              <span className="-mb-1 text-sm text-gray-400">S</span>
            </div>

            <div className="mt-6 flex gap-6 justify-center">
              <button className="flex w-28 flex-col items-center gap-3 rounded-full p-3 text-sm text-gray-200 hover:bg-white/5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151928]">
                  <ArrowUpRight size={18} />
                </span>
                <span>Send</span>
              </button>
              <button className="flex w-28 flex-col items-center gap-3 rounded-full p-3 text-sm text-gray-200 hover:bg-white/5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151928]">
                  <Download size={18} />
                </span>
                <span>Receive</span>
              </button>
            </div>
          </div>

          <div className="mx-6 my-2 h-px bg-white/10" />

          {/* assets list */}
          <div className="px-6">
            <div className="overflow-hidden">
              <Row
                icon={
                  <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                    {/* simple ETH logo */}
                    <svg viewBox="0 0 256 417" className="h-5 w-5" aria-hidden>
                      <polygon fill="#a3bffa" points="127.9,0 0,213.7 127.9,282.6 255.8,213.7"/>
                      <polygon fill="#94a3b8" points="127.9,416.3 255.8,246.3 127.9,315.3 0,246.3"/>
                    </svg>
                  </div>
                }
                symbol="ETH"
                priceUsd={2601.22}
                change={-2.32}
                balance={0}
              />
              <Row
                icon={
                <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                  <img src={coinAvatar} className="h-5 w-5" />
                </div>
                }
                symbol="SYC"
                priceUsd={0.015}
                change={+2.32}
                balance={0}
              />
            </div>
          </div>

          {/* bottom navbar */}
          <div className="mt-6 rounded-b-xl bg-gradient-to-t from-[#0A0F17] to-[#0A0A1A] px-6 py-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-300">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
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

              <div className="flex flex-col items-center gap-2">
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
