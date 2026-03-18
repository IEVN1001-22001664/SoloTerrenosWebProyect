"use client";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "../components/layout/navbar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

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

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-[#817d58]/20 bg-white shadow-lg px-4 py-3",
                title: "text-sm font-semibold text-[#22341c]",
                description: "text-sm text-[#6e6a4b]",
                actionButton:
                  "bg-[#22341c] text-white hover:bg-[#2d4724] rounded-lg px-3 py-1 text-sm",
                cancelButton:
                  "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg px-3 py-1 text-sm",
                closeButton:
                  "bg-transparent text-[#817d58] hover:text-[#22341c]",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}