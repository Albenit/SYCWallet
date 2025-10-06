import { useEffect, useState } from "react";

export default function useTokens(chainKey) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!chainKey) return;

    const fetchTokens = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/wallet/tokens/${chainKey}`);
        if (!res.ok) throw new Error("Failed to fetch tokens");
        const data = await res.json();
        setTokens(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [chainKey]);

  return { tokens, loading, error };
}
