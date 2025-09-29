import { useState } from "react";

export default function useSendTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");

  const sendTransaction = async (chainKey, signedTx) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://127.0.0.1:5000/api/wallet/${chainKey}/sendTransaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ signedTx }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return data; // should contain { hash }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendTransaction, loading, error };
}
