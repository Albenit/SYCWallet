import { useState } from "react";

const env = import.meta.env;

export default function useChangeNowSwap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);


  const createSwap = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const res = await fetch(`${env.VITE_API_URL}/changenow/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "ChangeNOW swap failed");
      }

      setData(json);
      return json;
    } catch (err) {
      console.error("❌ useChangeNowSwap error:", err);
      setError(err.message || "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createSwap, loading, error, data };
}
