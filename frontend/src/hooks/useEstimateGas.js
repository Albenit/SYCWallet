import { useState, useCallback } from "react";

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

export default function useEstimateGas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const estimateGas = useCallback(
    async ({ chainKey, to, from, amount, token, decimals }) => {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        const errObj = { code: "NO_AUTH", message: "No auth token found" };
        setError(errObj);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${apiUrl}/wallet/${chainKey}/estimateGas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            to,
            from,
            amount,
            token: token || null,
            decimals,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errPayload = toErrorObject(data);
          if (data?.context) {
            errPayload.context = data.context;
          }
          const error = Object.assign(new Error(errPayload.message || "Failed to estimate gas"), errPayload);
          setError(error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Gas estimation failed:", err);
        const normalized = err && typeof err === "object"
          ? { message: err.message || "Failed to estimate gas", code: err.code, ...err }
          : { message: "Failed to estimate gas" };
        const errorObj = Object.assign(new Error(normalized.message), normalized);
        setError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  return { estimateGas, loading, error };
}
