import { useEffect, useState } from "react";

export default function useChain() {
  const [chains, setChains] = useState([]); // always start with []
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChains = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/wallet/chains");
        if (!res.ok) throw new Error("Failed to fetch chains");

        const data = await res.json();

        // Defensive fallback → always array
        setChains(Array.isArray(data.chains) ? data.chains : []);
      } catch (err) {
        setError(err.message);
        setChains([]); // ensure still an array
      } finally {
        setLoading(false);
      }
    };

    fetchChains();
  }, []);

  return { chains, loading, error };
}
