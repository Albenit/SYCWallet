import { useEffect, useState } from "react";
import axios from "axios";

export default function useSwapEstimate(from, to, amount, fromNetwork, toNetwork) {
  
    
  const [data, setData] = useState(null);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const networkMap = {
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
  };

  const networkFrom = networkMap[fromNetwork] || fromNetwork;
  const networkTo = networkMap[toNetwork] || toNetwork;

  useEffect(() => {
    if (!amount || amount <= 0) {
      setData(null);
      return;
    }

    const fetchEstimate = async () => {
      setLoading(true);
      setError(null);

      try {
            const response = await axios.post("http://127.0.0.1:5000/api/swap/estimate", {
            params: {
                from: from.toLowerCase(),
                fromNetwork: networkFrom,
                to: to.toLowerCase(),
                toNetwork: networkTo,
                amount: amount
            }
            });

        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [from, to, amount, fromNetwork, toNetwork]);

  return { data, loading, error };
}
