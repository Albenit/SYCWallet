import React from "react";

export default function Row({
  icon,
  symbol,
  chain = "Ethereum",
  priceUsd = null,
  change = null,
  balance,
  usdValue,
}) {
  return (
    <div className="px-2 flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <img src={icon} alt="" className="flex-none" width={35} height={35} />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide">{symbol}</span>
            <span className="rounded bg-[#18212d] px-2 py-[2px] text-[11px] text-gray-300">
              {chain}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-300">
            {priceUsd && (
              <span>${priceUsd}</span>
            )}
            {change && (
              <span
                className={
                  change < 0 ? "text-[#f87171]" : "text-[#22c55e]"
                }
              >
                {change > 0
                  ? `+${change.toFixed(2)}%`
                  : `${change.toFixed(2)}%`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-semibold tracking-tight">
          {balance}
        </div>
        {usdValue && (
          <div className="text-xs text-gray-400">${usdValue}</div>
        )}
      </div>
    </div>
  );
}
