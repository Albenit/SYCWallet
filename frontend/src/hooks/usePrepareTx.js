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

export default function usePrepareTx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");
  const apiUrl = import.meta.env.VITE_API_URL;

  const prepareTx = async (chainKey, txData, walletAddress) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiUrl}/wallet/${chainKey}/prepareTx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from: walletAddress, ...txData }, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        const errPayload = toErrorObject(data);
        if (data?.context) {
          errPayload.context = data.context;
        }
        const errorObj = Object.assign(new Error(errPayload.message || "Failed to prepare transaction"), errPayload);
        setError(errorObj);
        throw errorObj;
      }

      return data; // { tx, meta }
    } catch (err) {
      if (!err?.message) {
        const fallback = new Error("Failed to prepare transaction");
        setError(fallback);
        throw fallback;
      }
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { prepareTx, loading, error };
}
