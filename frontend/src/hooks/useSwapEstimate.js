import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Fetches a quote from your backend, which in turn queries ChangeNOW.
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
    ) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (!fromAsset?.changeNowTicker || !toAsset?.changeNowTicker) {
      setData(null);
      setError({
        code: "unsupported_asset",
        message: "ChangeNOW does not support the selected asset on this network.",
        minAmount: null,
        payload: null,
      });
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/changenow/quote`, {
          sellAsset: fromAsset,
          buyAsset: toAsset,
          sellAmount: amount.toString(),
          sourceAddress: walletAddress,
          destinationAddress: walletAddress,
          fromChain,
          toChain,
        });
        if (cancelled) return;
        setData(res.data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const apiError = err.response?.data;
        const code = apiError?.error || err.message;
        const message = apiError?.message || err.message;
        const minAmount = apiError?.payload?.range?.minAmount ?? null;
        setData(null);
        setError({
          code,
          message,
          minAmount,
          payload: apiError?.payload || null,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    fromAsset,
    toAsset,
    amount,
    fromChain,
    toChain,
    walletAddress,
    fromAsset?.changeNowTicker,
    toAsset?.changeNowTicker,
  ]);

  return { data, loading, error };
}
