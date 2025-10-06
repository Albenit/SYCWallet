import { useState } from "react";

export default function useSendTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const sendTransaction = async (chainKey, signedTx) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/wallet/${chainKey}/sendTransaction`,
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
