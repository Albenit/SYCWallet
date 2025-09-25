import { useState } from "react";
import Row from "../partials/Row";
import plusIcon from "../../assets/svg/plusIcon.svg";
import useAllTokens from "../../hooks/useAllTokens";
import useAddRemoveToken from "../../hooks/useAddRemoveToken";

export default function TokensTab({
  portfolio,
  portfolioLoading,
  portfolioError,
  refetchPortfolio,
}: any) {
  const {
    tokens,
    loading: tokensLoading,
    error: tokensError,
    fetchTokens,
  } = useAllTokens();
  const { toggleToken } = useAddRemoveToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAnyTokenChanged, setHasAnyTokenChanged] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    fetchTokens();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (hasAnyTokenChanged) {
      refetchPortfolio();
      setHasAnyTokenChanged(false);
    }
  };

  const addRemoveToken = async (chain: string, address: string | null) => {
    try {
      const res = await toggleToken(chain, address);
      fetchTokens();
      setHasAnyTokenChanged(true);
    } catch (err) {
      console.error("Error toggling token:", err);
    }
  };

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
        <span>Add Tokens</span>
        <span>
          <img src={plusIcon} alt="add" />
        </span>
      </div>

      {/* Portfolio tokens */}
      {portfolio?.portfolio?.length > 0 ? (
        portfolio.portfolio.map((chain: any) =>
          chain.items?.map((item: any, idx: number) => (
            <div className="px-6" key={`${chain.chain}-${idx}`}>
              <Row
                icon={
                  <div className="h-9 w-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 256 417" className="h-5 w-5" aria-hidden>
                      <polygon
                        fill="#a3bffa"
                        points="127.9,0 0,213.7 127.9,282.6 255.8,213.7"
                      />
                      <polygon
                        fill="#94a3b8"
                        points="127.9,416.3 255.8,246.3 127.9,315.3 0,246.3"
                      />
                    </svg>
                  </div>
                }
                chain={chain.chain}
                symbol={item?.symbol || "UNKNOWN"}
                priceUsd={item?.usdPrice ? item.usdPrice : "0.00"}
                change={-2.32}
                balance={
                  item?.balance ? parseFloat(item.balance).toFixed(4) : "0.0000"
                }
                usdValue={(item?.usdValue || 0).toFixed(3)}
              />
            </div>
          ))
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

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 text-white p-6 rounded-lg w-[500px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-lg font-semibold">All Tokens</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto custom-scroll flex-1 pr-2">
              {tokensLoading && <p>Loading tokens…</p>}
              {tokensError && <p className="text-red-500">{tokensError}</p>}
              {!tokensLoading &&
                tokens?.map((chain: any) => (
                  <div key={chain.chain} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      {chain.chainLabel}
                    </h3>
                    <div className="space-y-2">
                      {chain.tokens.map((token: any, idx: number) => (
                        <div
                          key={`${chain.chain}-${idx}`}
                          className="flex items-center justify-between bg-white/5 rounded px-3 py-2"
                        >
                          <span>{token.symbol}</span>

                          {/* Toggle switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={token.active}
                              onChange={() =>
                                addRemoveToken(token.chain, token.address)
                              }
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
