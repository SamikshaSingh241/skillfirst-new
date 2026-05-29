import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { currentUser } = useContext(AuthContext);
  console.log('ProtectedRoute', { currentUser, role });

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const hasRoleMismatch = role && currentUser.role !== role;
  if (hasRoleMismatch) {
    return <Navigate to="/" replace />;
  }

  return children;
}