import React, { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import monexLogo from "../assets/monexLogo.png";
import useWalletMe from "../hooks/useWalletMe";
import usePortfolio from "../hooks/usePortfolio";
import Navbar from "../components/navbar";
import TokensTab from "../components/dashboardTabs/TokensTab";
import SendTab from "../components/dashboardTabs/SendTab";
import ReceiveTab from "../components/dashboardTabs/ReceiveTab";
import SwapTab from "../components/dashboardTabs/SwapTab";
import tokenIcon from "../assets/svg/tokensIcon.svg";
import sendIcon from "../assets/svg/sendIcon2.svg";
import receiveIcon from "../assets/svg/receiveIcon2.svg";
import swapIcon from "../assets/svg/swapIcon.svg";
import useBinancePrices from "../hooks/useBinancePrices";
import PageLayout from "../components/layouts/PageLayout";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("token");

  const { address, Addressloading } = useWalletMe();
  const {
    portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    refetchPortfolio,
  } = usePortfolio();

  const symbols = useMemo(() => {
    if (!portfolio?.portfolio) return [];
    return portfolio.portfolio.flatMap((chain) =>
      chain.items?.map((item) => item.binanceSymbol).filter(Boolean)
    );
  }, [portfolio]);

  const livePrices = useBinancePrices(symbols);

  const totalUsdValue = useMemo(() => {
    if (!portfolio?.portfolio) return 0;

    try {
      const total = portfolio.portfolio.reduce((sum, chain) => {
        const chainSum = chain.items?.reduce((acc, item) => {
          const balance = Number(item.balance) || 0;
          const symbol = item.binanceSymbol;
          const live = symbol ? livePrices[symbol] : null;

          let price = 0;
          if (live?.price) price = live.price;
          else if (item.usdPrice) price = item.usdPrice;
          else if (
            ["USDT", "USDC", "BUSD", "DAI"].includes(item.symbol?.toUpperCase())
          )
            price = 1;

          return acc + balance * price;
        }, 0);

        return sum + chainSum;
      }, 0);

      return Number.isFinite(total) ? total : 0;
    } catch (err) {
      console.error("Error calculating total value:", err);
      return 0;
    }
  }, [portfolio, livePrices]);

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
    <>
      <PageLayout>
        <div className="bg-[#1A1A1A] rounded-3xl">
          <div className="flex items-center justify-between px-6 pt-6 ">
            <div className="flex items-center bg-[#121212] p-3 rounded-full">
              <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                <img src={monexLogo} alt="coin avatar" className="h-6 w-7"/>
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
          </div>

          {/* Total Balance */}
          <div className="px-6 pb-4 pt-6">
            <div>
              <span className="text-[12px] text-[#767676]">Your Balance</span>
            </div>
            <div className="flex items-center  text-[35px] font-bold tracking-wide sm:text-4xl">
              {portfolioLoading ? ("$…") : (
                <>
                  <span className="text-3xl">$</span>
                  <span className="text-3xl">{totalUsdValue.toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-6 flex items-center justify-between bg-[#121212] rounded-2xl p-1.5">
              {[
                { key: "token", label: "Tokens", icon: tokenIcon },
                { key: "send", label: "Send", icon: sendIcon },
                { key: "swap", label: "Swap", icon: swapIcon },
                { key: "receive", label: "Receive", icon: receiveIcon },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`
                    cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 px-1 rounded-xl text-xs sm:text-sm font-medium
                    transition-all duration-200 ease-out
                    ${tab === key
                      ? "bg-[#DE0072] text-white shadow-[0_2px_12px_rgba(222,0,114,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <img
                    src={icon}
                    alt={label}
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${tab === key ? "brightness-0 invert" : "opacity-60"}`}
                  />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {tab === "token" && (
                <TokensTab
                  portfolio={portfolio}
                  portfolioLoading={portfolioLoading}
                  portfolioError={portfolioError}
                  refetchPortfolio={refetchPortfolio}
                  livePrices={livePrices}
                />
              )}
              {tab === "send" && (
                <SendTab
                  portfolio={portfolio}
                  portfolioLoading={portfolioLoading}
                  portfolioError={portfolioError}
                  refetchPortfolio={refetchPortfolio}
                />
              )}
              {tab === "swap" && <SwapTab />}
              {tab === "receive" && (
                <ReceiveTab
                  address={address}
                  handleCopy={handleCopy}
                  copied={copied}
                />
              )}
            </div>
          </div>

        </div>

        <Navbar />
      </PageLayout>

    </>
  );
}
