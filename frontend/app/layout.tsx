"use client";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "../components/layout/navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {!isAdminRoute && <Navbar />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}