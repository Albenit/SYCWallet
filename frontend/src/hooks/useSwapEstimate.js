import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function useSwapEstimate(from, to, amount, fromNetwork, toNetwork) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const networkMap = useMemo(() => ({
    ethereum: "eth",
    sepolia: "sepolia",
    polygon: "pol",
    bsc: "bsc",
    arbitrum: "arbitrum",
    avalanche: "avax_cchain",
    fantom: "fantom",
    gnosis: "gnosis",
    base: "base",
    zksync: "zksync",
  }), []);

  const networkFrom = networkMap[fromNetwork] || fromNetwork;
  const networkTo = networkMap[toNetwork] || toNetwork;

  useEffect(() => {
    const amt = Number(amount);
    if (!from || !to || !fromNetwork || !toNetwork || !amt || !(amt > 0)) {
      setData(null);
      setError(null);
      return;
    }

    const fetchEstimate = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          from: String(from).toLowerCase(),
          to: String(to).toLowerCase(),
          amount: amt,
          fromNetwork: networkFrom,
          toNetwork: networkTo,
        };

        // Use GET with query params to match backend flexibility
        const response = await axios.get(`${apiUrl}/swap/estimate`, { params });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [from, to, amount, fromNetwork, toNetwork, apiUrl, networkFrom, networkTo]);

  return { data, loading, error };
}
