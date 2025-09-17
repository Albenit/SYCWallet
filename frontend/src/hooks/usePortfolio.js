import { useState, useEffect } from "react";

const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/wallet/chain/portfolio", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch portfolio");

        const data = await res.json();
        setPortfolio(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return { portfolio, loading, error };
};

export default usePortfolio;
