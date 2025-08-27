import React from "react";
import { Navigate } from "react-router-dom";
import { AuthCtx } from "./AuthContext";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { token } = React.useContext(AuthCtx);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}