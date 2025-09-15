import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    // 🚫 If no token, redirect to start/login page
    return <Navigate to="/" />;
  }


  return children;
};

export default ProtectedRoute;
