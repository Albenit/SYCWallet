// src/hooks/useNonce.js
import { useState, useCallback } from "react";

const API = "http://127.0.0.1:5000"; // Or use your actual API base URL

const useNonce = () => {
  const [nonce, setNonce] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNonce = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    setNonce(null);

    try {
      const nonceRes = await fetch(`${API}/api/auth/nonce`, {
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
