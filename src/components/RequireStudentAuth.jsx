import React from "react";
import { Navigate } from "react-router-dom";
import { useStudentAuth } from "../context/StudentAuthContext";

export default function RequireStudentAuth({ children }) {
  const { student, loading } = useStudentAuth();

  if (loading) return null;
  if (!student) return <Navigate to="/" replace />;
  return children;
}
