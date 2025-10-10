import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Fetches a quote from your backend, which in turn calls SwapKit.
 * Automatically sends correct from/to chain and token info.
 */
export default function useSwapEstimate(fromAsset, toAsset, amount, fromChain, toChain, walletAddress) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      !fromAsset ||
      !toAsset ||
      !fromChain ||
      !toChain ||
      !walletAddress ||
      !amount ||
      Number(amount) <= 0
    ) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/swapkit/quote`, {
          sellAsset: fromAsset,
          buyAsset: toAsset,
          sellAmount: amount.toString(),
          sourceAddress: walletAddress,
          destinationAddress: walletAddress,
          slippage: 1,
          includeTx: false,
          fromChain,
          toChain,
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ SwapKit quote failed:", err.response?.data || err.message);
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [fromAsset, toAsset, amount, fromChain, toChain, walletAddress]);

  return { data, loading, error };
}
