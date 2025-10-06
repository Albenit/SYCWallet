import { useState, useCallback } from "react";

const useAllTokens = () => {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found");

      const res = await fetch(apiUrl + "/wallet/all-tokens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch tokens");
      }

      const data = await res.json();
      setTokens(data);
    } catch (e) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { tokens, loading, error, fetchTokens };
};

export default useAllTokens;
