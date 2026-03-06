"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={["cliente"]}>
      <h1>Dashboard Cliente</h1>
    </ProtectedRoute>
  );
}
