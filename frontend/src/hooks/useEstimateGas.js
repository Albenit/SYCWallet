import { useState, useCallback } from "react";

export default function useEstimateGas() {
  const [feeEstimate, setFeeEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const estimateGas = useCallback(async ({ chainKey, to, from, amount, token, decimals }) => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      setError("No auth token found");
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setFeeEstimate(null);

      const res = await fetch(`${apiUrl}/wallet/${chainKey}/estimateGas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            to,
            from,
            amount,
            token: token || null,
            decimals
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const formatted = `${data.fee} ${data.symbol}`;
      setFeeEstimate(formatted);
      return formatted;
    } catch (err) {
      console.error("Gas estimation failed:", err);
      setError(err.message || "Failed to estimate gas");
      setFeeEstimate(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { estimateGas, feeEstimate, loading, error };
}
