import { useState, useEffect } from "react";

const useNativeBalance = (address, selectedChain) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address || !selectedChain) return;

    const token = localStorage.getItem("auth_token");

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const balRes = await fetch(
          `http://127.0.0.1:5000/api/wallet/${selectedChain}/native-balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!balRes.ok) throw new Error("Failed to fetch balance");
        const data = await balRes.json();
        setBalance(data.balance);
      } catch (e) {
        setError(e.message || "Error fetching balance");
        setBalance(null); 
      } finally {
        setLoading(false); 
      }
    };

    fetchBalance();
  }, [address, selectedChain]);

  return { balance, loading, error };
};

export default useNativeBalance;
