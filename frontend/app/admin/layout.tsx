"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminTopbar from "@/components/admin/adminTopbar";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen">

        {/* 🔵 TOPBAR */}
        <AdminTopbar />

        {/* 🔵 BODY */}
        <div className="flex pt-16">

          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />

          <main className="flex-1 p-6 bg-gray-100 min-h-screen">
            {children}
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}