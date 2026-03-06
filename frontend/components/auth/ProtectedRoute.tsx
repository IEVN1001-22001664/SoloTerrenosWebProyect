"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
      router.push("/");
      return;
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) return null;

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.rol)) return null;

  return <>{children}</>;
}