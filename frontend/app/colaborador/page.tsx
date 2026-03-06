"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function Colaborador() {
  return (
    <ProtectedRoute allowedRoles={["colaborador"]}>
      <h1>Dashboard Colaborador</h1>
    </ProtectedRoute>
  );
}