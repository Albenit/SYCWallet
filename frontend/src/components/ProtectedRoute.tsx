import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <p className="text-center">Checking authentication…</p>;
  }
  

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}