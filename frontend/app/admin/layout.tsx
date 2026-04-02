"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminTopbar from "@/components/admin/adminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div
        className="min-h-screen"
        style={{ backgroundColor: "#eaf0f6" }}
      >
        <AdminTopbar />

        <div className="flex pt-16">
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <main
            className="min-h-[calc(100vh-4rem)] flex-1 p-5 md:p-6 lg:p-8"
            style={{ backgroundColor: "#eaf0f6" }}
          >
            <div className="mx-auto max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}