import { useState } from "react";

const useAddRemoveToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleToken = async (chain, tokenAddress) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token found");

      const res = await fetch("http://127.0.0.1:5000/api/wallet/toggle-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chain, tokenAddress }),
      });

      if (!res.ok) throw new Error("Failed to update token status");

      return await res.json();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { toggleToken, loading, error };
};

export default useAddRemoveToken;
