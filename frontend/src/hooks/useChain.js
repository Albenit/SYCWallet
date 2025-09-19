import { useState } from "react";
import axios from "axios";

export default function useChain() {
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChain = async (key) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`http://127.0.0.1:5000/api/wallet/chain/${key}`);
      setChain(data);
    } catch (err) {
      setError(err.message || "Failed to fetch chain");
      setChain(null);
    } finally {
      setLoading(false);
    }
  };

  return { chain, loading, error, fetchChain };
}
