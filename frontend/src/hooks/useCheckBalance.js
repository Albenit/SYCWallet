import { useCallback, useState } from "react";

const env = import.meta.env;

export default function useCheckBalance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const checkBalance = useCallback(async (address, chain, token = null) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const res = await fetch(`${env.VITE_API_URL}/swap/check-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain, token }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to check balance");
      }

      setData(json);
      return json;
    } catch (err) {
      console.error("❌ useCheckBalance error:", err);
      setError(err.message || "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkBalance, loading, error, data };
}
