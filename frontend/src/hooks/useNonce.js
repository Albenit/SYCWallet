import { useState, useCallback } from "react";

const useNonce = () => {
  const [nonce, setNonce] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchNonce = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    setNonce(null);

    try {
      const nonceRes = await fetch(`${apiUrl}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
        credentials: "include",
      });

      if (!nonceRes.ok) {
        const t = await nonceRes.text().catch(() => "");
        throw new Error(t || "Could not get nonce from server");
      }

      const data = await nonceRes.json();
      setNonce(data.nonce);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { nonce, loading, error, fetchNonce };
};

export default useNonce;
