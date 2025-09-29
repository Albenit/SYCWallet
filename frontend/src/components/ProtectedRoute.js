import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!token) {
      return navigate("/"); 
    }

  }, [token])

    return children;
  };

export default ProtectedRoute; 
