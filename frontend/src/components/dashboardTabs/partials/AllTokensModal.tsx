import React, { useState, useEffect } from "react";
import useAllTokens from "../../../hooks/useAllTokens";
import useAddRemoveToken from "../../../hooks/useAddRemoveToken";

export default function AllTokensModal({isOpen,onClose,refetchPortfolio,}:any) {
  const {
    tokens,
    loading: tokensLoading,
    error: tokensError,
    fetchTokens,
  } = useAllTokens();
  const { toggleToken } = useAddRemoveToken();
  const [hasAnyTokenChanged, setHasAnyTokenChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // <-- search state

  useEffect(() => {
    if (isOpen) {
      fetchTokens();
    }
  }, [isOpen, fetchTokens]);

  const closeModal = () => {
    onClose();
    if (hasAnyTokenChanged) {
      refetchPortfolio();
      setHasAnyTokenChanged(false);
    }
  };

  const addRemoveToken = async (chain: string, address: string | null) => {
    try {
      await toggleToken(chain, address);
      fetchTokens();
      setHasAnyTokenChanged(true);
    } catch (err) {
      console.error("Error toggling token:", err);
    }
  };

  const filteredTokens = tokens?.map((chain: any) => ({
    ...chain,
    tokens: chain.tokens.filter((token: any) => {
      const query = searchQuery.toLowerCase();
      return (
        token.symbol?.toLowerCase().includes(query) ||
        token.fullName?.toLowerCase().includes(query)
      );
    }),
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 mx-4 mx-sm-0"
      onClick={closeModal}
    >
      <div
        className="bg-[#1A1A1A] text-white p-6 rounded-lg w-[500px] max-h-[80vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Tokens</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="mb-5 mt-2 pe-3">
          <input
            type="text"
            placeholder="Search.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // update state
            className="w-full rounded-md bg-[#121212] px-4 py-3 text-sm text-white text-[12px] focus:outline-none"
          />
        </div>

        <div className="overflow-y-auto custom-scroll flex-1 pr-2 ">
          {tokensError && <p className="text-red-500">{tokensError}</p>}
          {filteredTokens?.map((chain: any) => (
              <div key={chain.chain} className="mb-4">
                {chain.tokens.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      {chain.chainLabel}
                    </h3>
                    <div className="space-y-2">
                      {chain.tokens.map((token: any, idx: number) => (
                        <div
                          key={`${chain.chain}-${idx}`}
                          className="flex items-center justify-between bg-white/2 rounded-3xl px-3 py-2"
                        >
                          <div className="flex items-center">
                            <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full mr-2"/>
                            <span>{token.fullName} ({token.symbol})</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={token.active}
                              onChange={() =>
                                addRemoveToken(token.chain, token.address)
                              }
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-[#DE0072] transition-colors"></div>
                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
