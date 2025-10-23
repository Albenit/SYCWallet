import { useState } from "react";

const toErrorObject = (raw) => {
  if (!raw) return { message: "Request failed" };
  if (raw.error) {
    if (typeof raw.error === "string") {
      return { message: raw.error };
    }
    return { ...raw.error };
  }
  return { message: raw.message || "Request failed" };
};

export default function useSendTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const sendTransaction = async (chainKey, signedTx) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/wallet/${chainKey}/sendTransaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ signedTx }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errPayload = toErrorObject(data);
        if (data?.context) {
          errPayload.context = data.context;
        }
        const errorObj = Object.assign(new Error(errPayload.message || "Transaction failed"), errPayload);
        setError(errorObj);
        throw errorObj;
      }

      return data; // should contain { hash }
    } catch (err) {
      if (!err?.message) {
        const fallback = new Error("Transaction failed");
        setError(fallback);
        throw fallback;
      }
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendTransaction, loading, error };
}
