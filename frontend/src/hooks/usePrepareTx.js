import { useState } from "react";

export default function usePrepareTx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const prepareTx = async (chainKey, txData, walletAddress) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/wallet/${chainKey}/prepareTx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ from: walletAddress, ...txData }, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          ),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return data; // preparedTx
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { prepareTx, loading, error };
}
