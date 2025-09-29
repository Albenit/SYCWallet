import { useState } from "react";

export default function usePrepareTx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");

  const prepareTx = async (chainKey, txData, walletAddress) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://127.0.0.1:5000/api/wallet/${chainKey}/prepareTx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ from: walletAddress, ...txData }),
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
