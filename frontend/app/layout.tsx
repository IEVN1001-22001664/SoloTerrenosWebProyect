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
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const usesHeroOverlay =
    pathname === "/" || pathname === "/tipos";
  const usesWhiteShell =
    pathname.startsWith("/zonas");
  const usesSlateShell =
    pathname.startsWith("/publicar");

  const mainClassName = isAdminRoute
    ? "w-full min-h-screen"
    : isAuthRoute
    ? "w-full min-h-screen bg-transparent pt-0"
    : usesHeroOverlay
    ? "w-full min-h-screen bg-transparent pt-0"
    : usesWhiteShell
    ? "w-full min-h-screen bg-white pt-[var(--navbar-safe-offset)]"
    : usesSlateShell
    ? "w-full min-h-screen bg-gray-50 pt-[var(--navbar-safe-offset)]"
    : "w-full min-h-screen bg-[var(--page-shell-background)] pt-[var(--navbar-safe-offset)]";

  return (
    <html lang="es">
      <body className="antialiased text-[#22341c]">
        <AuthProvider>
          {!isAdminRoute && !isAuthRoute && <Navbar />}

          <main className={mainClassName}>
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
