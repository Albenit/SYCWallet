import React, { useState, useMemo } from "react";
import Row from "../partials/Row";
import plusIcon from "../../assets/svg/plusIcon.svg";
import AllTokensModal from "./partials/AllTokensModal";

export default function TokensTab({portfolio,portfolioLoading,portfolioError,refetchPortfolio,livePrices}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (portfolioLoading)
    return <p className="text-gray-400 text-sm">Loading tokens…</p>;
  if (portfolioError)
    return <p className="text-red-500 text-sm">{portfolioError}</p>;

  return (
    <div className="space-y-4">
      <div
        className="flex justify-end gap-2 text-sm text-blue-400 font-medium cursor-pointer"
        onClick={openModal}
      >
        <span>
          <img src={plusIcon} alt="add" />
        </span>
      </div>

      {/* Portfolio tokens */}
      <div className="max-h-[280px] overflow-y-auto custom-scroll pe-1">
        {portfolio?.portfolio?.length > 0 ? (
          portfolio.portfolio.map((chain: any) =>
            chain.items?.map((item: any, idx: any) => {
              let  livePrice = livePrices[item.binanceSymbol];

              if (!livePrice && ["USDT", "USDC", "DAI"].includes(item.symbol?.toUpperCase())){
                livePrice = { price: 1, change: 0 }; 
              }
              
              const usdValue = livePrice
                ? (parseFloat(item.balance) * livePrice.price).toFixed(4)
                : (item.usdValue || 0).toFixed(4);

              return (
                <div key={`${chain.chain}-${idx}`}>
                  <Row
                    icon={item?.logo}
                    chain={chain.chain}
                    symbol={item?.symbol || "UNKNOWN"}
                    priceUsd={livePrice ? livePrice.price : "0.00"}
                    change={livePrice ? livePrice.change : 0}
                    balance={item?.balance ? item.balance : "0.0000"}
                    usdValue={usdValue}
                  />
                </div>
              );
            })
          )
        ) : (
          <div className="px-6 text-center text-gray-400 text-sm">
            No tokens added yet.{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={openModal}
            >
              Click here to add one
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      <AllTokensModal
        isOpen={isModalOpen}
        onClose={closeModal}
        refetchPortfolio={refetchPortfolio}
      />
    </div>
  );
}
