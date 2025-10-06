import { useState, useEffect } from 'react';

const useWalletMe = () => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await fetch(apiUrl + "/wallet/me", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to Authorization header
          },
        });

        if (!res.ok) throw new Error("Failed to fetch address");

        const me = await res.json();
        setAddress(me.address);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, []);

  return { address, loading, error };
};

export default useWalletMe;
