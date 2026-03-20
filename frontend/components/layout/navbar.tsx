"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageCircle,
  LayoutGrid,
  PlusCircle,
  ChevronRight,
  Menu,
  X,
  Settings,
  BadgeCheck,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  referencia_id?: number;
  referencia_tipo?: string;
  metadata?: any;
  creado_en: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [openNotifPanel, setOpenNotifPanel] = useState(false);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  

  const navLinksPublic = [
    { label: "Comprar", href: "/terrenos" },
    { label: "Vender", href: "/publicar" },
    { label: "Tipos de terrenos", href: "/tipos" },
    { label: "Zonas", href: "/zonas" },
    { label: "Desarrollos", href: "/desarrollos" },
  ];

  const navLinksColaborador = [
    { label: "Centro de control", href: "/colaborador" },
    { label: "Mis terrenos", href: "/colaborador/misTerrenos" },
    { label: "Leads", href: "/colaborador/leads" },
    { label: "Mensajes", href: "/colaborador/mensajes" },
  ];

  const totalNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  const ultimasNotificaciones = useMemo(
    () => notificaciones.slice(0, 6),
    [notificaciones]
  );

  const rolBadge =
    user?.rol === "colaborador"
      ? "COLABORADOR"
      : user?.rol === "usuario"
      ? "USUARIO"
      : "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.rol === "admin") return;

    fetchNotificaciones();
  }, [loading, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setOpenNotifPanel(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setCargandoNotificaciones(true);

      const response = await fetch(
        "http://localhost:5000/api/notificaciones/mis-notificaciones",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setNotificaciones([]);
        return;
      }

      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando notificaciones navbar:", error);
      setNotificaciones([]);
    } finally {
      setCargandoNotificaciones(false);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/notificaciones/${id}/leer`, {
        method: "PATCH",
        credentials: "include",
      });

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await fetch("http://localhost:5000/api/notificaciones/leer-todas", {
        method: "PATCH",
        credentials: "include",
      });

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setOpenNotifPanel(false);
    setOpenProfileMenu(false);
    router.push("/login");
    router.refresh();
  };

  const handleOpenNotificacion = async (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id);
    }

    setOpenNotifPanel(false);

    if (
      notificacion.tipo === "mensaje_nuevo" &&
      notificacion.metadata?.conversacion_id
    ) {
      if (user?.rol === "colaborador") {
        router.push(
          `/colaborador/mensajes?conversacion=${notificacion.metadata.conversacion_id}`
        );
        return;
      }

      if (user?.rol === "usuario") {
        router.push(
          `/usuario/mensajes?conversacion=${notificacion.metadata.conversacion_id}`
        );
        return;
      }
    }

    if (notificacion.tipo === "lead_nuevo") {
      router.push("/colaborador/leads");
      return;
    }

    if (user?.rol === "colaborador") {
      router.push("/colaborador/notificaciones");
      return;
    }

    router.push("/usuario/mensajes");
  };

  // Los returns condicionales van DESPUÉS de todos los hooks
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  if (loading) return null;

  return (
    <header className="fixed left-0 top-4 z-50 flex w-full justify-center">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-[95%] max-w-7xl rounded-2xl border px-6 py-4 backdrop-blur-lg transition-all duration-300 ${
          scrolled
            ? "border-[#817d58]/15 bg-white/88 shadow-lg"
            : "border-transparent bg-white/72"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 280 }}
              className="relative flex items-center"
            >
              <Image
                src="/logo2.png"
                alt="Solo Terrenos"
                width={150}
                height={40}
                priority
                className="h-9 w-auto object-contain"
              />
            </motion.div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {!user &&
              navLinksPublic.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition hover:text-[#828d4b] ${
                    pathname === link.href ? "text-[#22341c]" : "text-[#4f4a3d]"
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
                  className={`transition hover:text-[#828d4b] ${
                    pathname === link.href ? "text-[#22341c]" : "text-[#4f4a3d]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            {user?.rol === "colaborador" &&
              navLinksColaborador.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition hover:text-[#828d4b] ${
                    pathname === link.href ? "text-[#22341c]" : "text-[#4f4a3d]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <span className="rounded-full bg-[#9f885c]/18 px-3 py-1 text-xs font-semibold uppercase text-[#22341c]">
                {rolBadge}
              </span>
            )}

            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#4f4a3d] transition hover:text-[#22341c]"
                >
                  Ingresar
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-[#22341c] px-4 py-2 text-sm text-white transition hover:bg-[#828d4b]"
                >
                  Registrarse
                </Link>
              </>
            )}

            {(user?.rol === "usuario" || user?.rol === "colaborador") && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setOpenNotifPanel((prev) => !prev)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#817d58]/15 bg-white text-[#22341c] transition hover:bg-[#f7f6f1]"
                >
                  <Bell size={18} />
                  {totalNoLeidas > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#828d4b] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                      {totalNoLeidas > 9 ? "9+" : totalNoLeidas}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {openNotifPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-[#817d58]/12 px-4 py-4">
                        <div>
                          <h3 className="font-semibold text-[#22341c]">
                            Notificaciones
                          </h3>
                          <p className="text-xs text-[#817d58]">
                            {totalNoLeidas} sin leer
                          </p>
                        </div>

                        {totalNoLeidas > 0 && (
                          <button
                            type="button"
                            onClick={marcarTodasComoLeidas}
                            className="text-xs font-medium text-[#828d4b] transition hover:text-[#22341c]"
                          >
                            Marcar todas
                          </button>
                        )}
                      </div>

                      <div className="max-h-[420px] overflow-y-auto">
                        {cargandoNotificaciones ? (
                          <div className="p-4 text-sm text-[#817d58]">
                            Cargando...
                          </div>
                        ) : ultimasNotificaciones.length === 0 ? (
                          <div className="p-4 text-sm text-[#817d58]">
                            No hay notificaciones.
                          </div>
                        ) : (
                          ultimasNotificaciones.map((notificacion) => (
                            <button
                              key={notificacion.id}
                              type="button"
                              onClick={() => handleOpenNotificacion(notificacion)}
                              className={`w-full border-b border-[#817d58]/10 px-4 py-4 text-left transition hover:bg-[#faf9f5] ${
                                notificacion.leida ? "bg-white" : "bg-[#f7f6f1]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#9f885c]/14 text-[#22341c]">
                                  <Bell size={16} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="line-clamp-1 font-medium text-[#22341c]">
                                      {notificacion.titulo}
                                    </p>
                                    {!notificacion.leida && (
                                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#828d4b]" />
                                    )}
                                  </div>

                                  <p className="mt-1 line-clamp-2 text-sm text-[#817d58]">
                                    {notificacion.mensaje}
                                  </p>

                                  <p className="mt-2 text-[11px] text-[#9f885c]">
                                    {formatFecha(notificacion.creado_en)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="border-t border-[#817d58]/12 p-3">
                        <Link
                          href={
                            user?.rol === "colaborador"
                              ? "/colaborador/notificaciones"
                              : "/usuario/mensajes"
                          }
                          onClick={() => setOpenNotifPanel(false)}
                          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                        >
                          Ver todas
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user?.rol === "usuario" && (
              <>
                <Link
                  href="/usuario/mensajes"
                  className="transition hover:text-[#828d4b] text-[#4f4a3d]"
                >
                  Mensajes
                </Link>

                <Link
                  href="/dashboard"
                  className="transition hover:text-[#828d4b] text-[#4f4a3d]"
                >
                  Mi cuenta
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 transition hover:text-red-600"
                >
                  Cerrar sesión
                </button>
              </>
            )}

            {user?.rol === "colaborador" && (
              <>
                <Link
                  href="/colaborador/mensajes"
                  className="flex items-center gap-2 text-[#4f4a3d] transition hover:text-[#828d4b]"
                >
                  <MessageCircle size={16} />
                  
                </Link>

                <Link
                  href="/colaborador"
                  className="flex items-center gap-2 text-[#4f4a3d] transition hover:text-[#828d4b]"
                >
                  <LayoutGrid size={16} />
                </Link>

                <Link
                  href="/publicar"
                  className="flex items-center gap-2 rounded-xl bg-[#22341c] px-4 py-2 text-sm text-white transition hover:bg-[#828d4b]"
                >
                  <PlusCircle size={16} />
                  Publicar
                </Link>

                <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setOpenProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[#817d58]/15 bg-white px-3 py-2 text-[#22341c] transition hover:bg-[#f7f6f1]"
                >
                  {user?.foto_perfil ? (
                    <img
                      src={`http://localhost:5000${user.foto_perfil}`}
                      alt="Foto de perfil"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9f885c]/15">
                      <User size={16} />
                    </div>
                  )}
                  <ChevronDown size={16} />
                </button>

              <AnimatePresence>
                {openProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
                  >
                    <div className="border-b border-[#817d58]/12 px-4 py-4">
                      <div className="flex items-center gap-3">
                        {user?.foto_perfil ? (
                          <img
                            src={`http://localhost:5000${user.foto_perfil}`}
                            alt="Foto de perfil"
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-[#9f885c]/15"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#9f885c]/15 text-[#22341c]">
                            <User size={20} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#22341c]">
                            {user?.nombre || "Colaborador"}
                          </p>
                          <p className="text-xs uppercase tracking-[0.12em] text-[#817d58]">
                            Colaborador
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/colaborador/perfil"
                        onClick={() => setOpenProfileMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        <User size={16} />
                        Mi perfil
                      </Link>

                      <Link
                        href="/colaborador"
                        onClick={() => setOpenProfileMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        <LayoutGrid size={16} />
                        Centro de control
                      </Link>

                      <Link
                        href="/colaborador/configuracion"
                        onClick={() => setOpenProfileMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        <Settings size={16} />
                        Configuración
                      </Link>

                      <Link
                        href="/colaborador/membresia"
                        onClick={() => setOpenProfileMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        <BadgeCheck size={16} />
                        Membresía
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
              </>
            )}
          </div>

          <button
            className="text-[#22341c] md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#817d58]/12 bg-white p-5 shadow-xl md:hidden"
            >
              {!user &&
                navLinksPublic.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
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
                      className="text-[#22341c]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/usuario/mensajes"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Mensajes
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Mi cuenta
                  </Link>
                </>
              )}

              {user?.rol === "colaborador" && (
                <>
                  <Link
                    href="/colaborador"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Centro de control
                  </Link>
                  <Link
                    href="/colaborador/misTerrenos"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Mis terrenos
                  </Link>
                  <Link
                    href="/colaborador/leads"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Leads
                  </Link>
                  <Link
                    href="/colaborador/mensajes"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Mensajes
                  </Link>
                  <Link
                    href="/colaborador/notificaciones"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Notificaciones
                  </Link>
                  <Link
                    href="/colaborador/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Perfil (próximamente)
                  </Link>
                  <Link
                    href="/publicar"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Publicar
                  </Link>
                </>
              )}

              {user ? (
                <button onClick={handleLogout} className="text-left text-red-500">
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#22341c]"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}