"use client";

import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ocultar navbar en login/register
  if (pathname === "/login" || pathname === "/register") return null;
  if (loading) return null;

  const navLinksPublic = [
    { label: "Comprar", href: "/terrenos" },
    { label: "Vender", href: "/publicar" },
    { label: "Tipos de terrenos", href: "/tipos" },
    { label: "Zonas poblacionales", href: "/zonas" },
    { label: "Desarrollos", href: "/desarrollos" },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed top-4 left-0 w-full z-50 flex justify-center">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
        w-[95%] max-w-7xl
        transition-all duration-300
        backdrop-blur-lg
        border
        rounded-2xl
        px-6 py-4
        flex justify-between items-center
        ${scrolled
          ? "bg-white/80 shadow-lg border-gray-200"
          : "bg-white/60 border-transparent"}
        `}
      >

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative flex items-center"
          >
            <Image
              src="/logo2.png"
              alt="Solo Terrenos"
              width={150}
              height={40}
              priority
              className="h-9 w-auto object-contain transition-all duration-300"
            />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition duration-500 blur-md"></div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium">

          {!user &&
            navLinksPublic.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`transition hover:text-[#426C8E] ${
                  pathname === link.href
                    ? "text-[#426C8E]"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}

          {user?.rol === "usuario" &&
            navLinksPublic.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`transition hover:text-[#426C8E] ${
                  pathname === link.href
                    ? "text-[#426C8E]"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}

          {user?.rol === "colaborador" && (
            <>
              <Link href="/colaborador/misTerrenos">Mis terrenos</Link>
              <Link href="/propuestas">Propuestas</Link>
              <Link href="/herramientas">Herramientas</Link>
            </>
          )}

          {user?.rol === "admin" && (
            <>
              <Link href="/admin">Panel</Link>
              <Link href="/admin/usuarios">Usuarios</Link>
              <Link href="/admin/terrenos">Terrenos</Link>
            </>
          )}
        </nav>

        {/* Right Section */}
        <div className="hidden md:flex gap-4 items-center">

          {user && (
            <span className="px-3 py-1 text-xs font-semibold uppercase rounded-full bg-[#99B5D2] text-[#003554]">
              {user.rol}
            </span>
          )}

          {!user && (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-700 hover:text-black transition"
              >
                Ingresar
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-[#426C8E] text-white text-sm hover:bg-[#365873] transition"
              >
                Registrarse
              </Link>
            </>
          )}

          {user?.rol === "usuario" && (
            <>
              <span>🔔</span>

              <Link
                href="/dashboard"
                className="hover:text-[#426C8E]"
              >
                Mi cuenta
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Cerrar sesión
              </button>
            </>
          )}

          {user?.rol === "colaborador" && (
            <>
              <span>🔔</span>
              <span>💬</span>

              <Link
                href="/publicar"
                className="px-4 py-2 rounded-lg bg-[#426C8E] text-white text-sm hover:bg-[#365873] transition"
              >
                Publicar
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Cerrar sesión
              </button>
            </>
          )}

          {user?.rol === "admin" && (
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Cerrar sesión
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 w-[90%] bg-white shadow-xl rounded-xl p-6 flex flex-col gap-4 md:hidden"
          >

            {!user &&
              navLinksPublic.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

            {user?.rol === "usuario" && (
              <>
                {navLinksPublic.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/dashboard">Mi cuenta</Link>
              </>
            )}

            {user?.rol === "colaborador" && (
              <>
                <Link href="/colaborador/misTerrenos">Mis terrenos</Link>
                <Link href="/propuestas">Propuestas</Link>
                <Link href="/herramientas">Herramientas</Link>
                <Link href="/publicar">Publicar</Link>
              </>
            )}

            {user?.rol === "admin" && (
              <>
                <Link href="/admin">Panel</Link>
                <Link href="/admin/usuarios">Usuarios</Link>
                <Link href="/admin/terrenos">Terrenos</Link>
              </>
            )}

            {user ? (
              <button onClick={handleLogout}>
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link href="/login">Ingresar</Link>
                <Link href="/register">Registrarse</Link>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}