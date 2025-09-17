import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate()

  if (!token) {
    return navigate("/signup");
  }

  return children;
};

export default ProtectedRoute;
