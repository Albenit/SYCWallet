import { useState } from "react";

const useAllTokens = () => {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found");

      const res = await fetch("http://127.0.0.1:5000/api/wallet/all-tokens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tokens");

      const data = await res.json();
      setTokens(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { tokens, loading, error, fetchTokens };
};

export default useAllTokens;
