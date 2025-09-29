import React, { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import coinAvatar from "../assets/svg/coinAvatar.svg";
import useWalletMe from "../hooks/useWalletMe";
import usePortfolio from "../hooks/usePortfolio";
import Navbar from "../components/navbar";
import TokensTab from "../components/dashboardTabs/TokensTab";
import SendTab from "../components/dashboardTabs/SendTab";
import ReceiveTab from "../components/dashboardTabs/ReceiveTab";
import SwapTab from "../components/dashboardTabs/SwapTab";
import tokenIcon from "../assets/svg/tokensIcon.svg";
import sendIcon from "../assets/svg/sendIcon.svg";
import receiveIcon from "../assets/svg/receiveIcon.svg";
import swapIcon from "../assets/svg/swapIcon.svg";
import useBinancePrices from "../hooks/useBinancePrices";
import PageLayout from "../components/layouts/PageLayout";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("token");

  const { address, Addressloading } = useWalletMe();
  const { portfolio, loading: portfolioLoading, error: portfolioError, refetchPortfolio } = usePortfolio();

  const symbols = useMemo(() => {
    if (!portfolio?.portfolio) return [];
    return portfolio.portfolio.flatMap((chain) =>
      chain.items?.map((item) => item.binanceSymbol).filter(Boolean)
    );
  }, [portfolio]);

  const livePrices = useBinancePrices(symbols);

  const totalUsdValue = useMemo(() => {
    if (!portfolio?.portfolio) return 0;

    return portfolio.portfolio.reduce((sum, chain) => {
      return (
        sum +
        chain.items.reduce((chainSum, item) => {
          const balance = parseFloat(item.balance || "0");

          const live = livePrices[item.binanceSymbol];
          const price = live?.price ?? item.usdPrice ?? 0;

          return chainSum + balance * price;
        }, 0)
      );
    }, 0);
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
              <Copy size={16} className="opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
      </div>

      <div className="px-6 pb-4 pt-6">
        <div className="flex items-center gap-2 text-3xl font-bold tracking-wide sm:text-4xl">
          {portfolioLoading
            ? "$…"
            : totalUsdValue
              ? totalUsdValue.toFixed(2)
              : "0.00"}
          <span className="-mb-1 text-sm text-gray-400 uppercase">$</span>
        </div>

        <div className="mt-6 flex gap-6 justify-center">
          <button onClick={() => setTab("token")} className={`flex flex-col items-center gap-2 text-sm ${tab === "token" ? "text-white" : "text-gray-400"}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02080E80]">
              <img src={tokenIcon} alt="tokens" />
            </span>
            <span>Tokens</span>
            {tab === "token" && <div className="h-[2px] w-8 bg-blue-500" />}
          </button>
          <button onClick={() => setTab("send")} className={`flex flex-col items-center gap-2 text-sm ${tab === "send" ? "text-white" : "text-gray-400"}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02080E80]">
              <img src={sendIcon} alt="send" />
            </span>
            <span>Send</span>
            {tab === "send" && <div className="h-[2px] w-8 bg-blue-500" />}
          </button>
          <button onClick={() => setTab("receive")} className={`flex flex-col items-center gap-2 text-sm ${tab === "receive" ? "text-white" : "text-gray-400"}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02080E80]">
              <img src={receiveIcon} alt="receive" />
            </span>
            <span>Receive</span>
            {tab === "receive" && <div className="h-[2px] w-8 bg-blue-500" />}
          </button>
          {/* <button onClick={() => setTab("swap")} className={`flex flex-col items-center gap-2 text-sm ${tab === "swap" ? "text-white" : "text-gray-400"}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02080E80]">
                    <img src={swapIcon} alt="receive" />
                  </span>
                  <span>Swap</span>
                  {tab === "receive" && <div className="h-[2px] w-8 bg-blue-500" />}
                </button> */}
        </div>
        <hr className="text-[#FFFFFF1A] my-4"/>

        {/* Tab Content */}
        <div className="mt-8">
          {tab === "token" && (<TokensTab portfolio={portfolio} portfolioLoading={portfolioLoading} portfolioError={portfolioError} refetchPortfolio={refetchPortfolio} livePrices={livePrices} />)}
          {tab === "send" && (<SendTab portfolio={portfolio} portfolioLoading={portfolioLoading} portfolioError={portfolioError} refetchPortfolio={refetchPortfolio} />)}
          {tab === "receive" && <ReceiveTab address={address} handleCopy={handleCopy} />}
          {tab === "swap" && <SwapTab />}
        </div>
      </div>
      <Navbar />
    </PageLayout>
  );
}
