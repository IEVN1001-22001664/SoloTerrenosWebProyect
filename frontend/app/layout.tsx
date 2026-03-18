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
  const isLandingPage = pathname === "/";

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {!isAdminRoute && <Navbar />}

          <main
            className={
              !isAdminRoute && !isLandingPage
                ? "pt-20 md:pt-18"
                : ""
            }
          >
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}