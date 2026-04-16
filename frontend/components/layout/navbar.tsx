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
  Heart,
  ShieldCheck,
} from "lucide-react";
import { getSocket } from "@/src/lib/socket";

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

interface ConversacionResumen {
  conversacion_id: number;
  no_leidos?: string | number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading, refreshUser } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [openNotifPanel, setOpenNotifPanel] = useState(false);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const navLinksInvitadoUsuario = [
    { label: "Comprar", href: "/terrenos" },
    { label: "Zonas", href: "/zonas" },
    { label: "Tipos", href: "/tipos" },
    { label: "Planes", href: "/planes" },
  ];

  const navLinksColaborador = [
    { label: "Mis terrenos", href: "/colaborador/misTerrenos" },
    { label: "Leads", href: "/colaborador/leads" },
    { label: "Membresía", href: "/suscripciones" },
  ];

  const navLinksAdmin = [
    { label: "Comprar", href: "/terrenos" },
    { label: "Zonas", href: "/zonas" },
    // { label: "Desarrollos", href: "/desarrollos" }, // pendiente cuando exista la página
  ];

  const totalNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  const ultimasNotificaciones = useMemo(
    () => notificaciones.slice(0, 6),
    [notificaciones]
  );

  const fotoPerfilUrl = useMemo(() => {
    if (!user?.foto_perfil) return "";
    return `${API_URL}${user.foto_perfil}?v=${user?.foto_cache_key || Date.now()}`;
  }, [user?.foto_perfil, user?.foto_cache_key]);

  const navLinksDesktop = useMemo(() => {
    if (!user) return navLinksInvitadoUsuario;
    if (user.rol === "usuario") return navLinksInvitadoUsuario;
    if (user.rol === "colaborador") return navLinksColaborador;
    if (user.rol === "admin") return navLinksAdmin;
    return navLinksInvitadoUsuario;
  }, [user]);

  const navLinksMobile = useMemo(() => {
    if (!user) return navLinksInvitadoUsuario;
    if (user.rol === "usuario") return navLinksInvitadoUsuario;
    if (user.rol === "colaborador") return navLinksColaborador;
    if (user.rol === "admin") return navLinksAdmin;
    return navLinksInvitadoUsuario;
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenNotifPanel(false);
    setOpenProfileMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) return;

    if (
      (user.rol === "usuario" || user.rol === "colaborador") &&
      !user.foto_perfil
    ) {
      refreshUser();
    }
  }, [loading, user?.id, user?.rol, user?.foto_perfil, refreshUser]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.rol === "admin") return;

    fetchNotificaciones();
    fetchUnreadMessagesCount();
  }, [loading, user, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setOpenNotifPanel(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.rol === "admin") return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleNuevoMensaje = () => {
      fetchUnreadMessagesCount();
      fetchNotificaciones();
    };

    const handleNuevaNotificacion = () => {
      fetchNotificaciones();
    };

    socket.on("nuevo_mensaje", handleNuevoMensaje);
    socket.on("nueva_notificacion", handleNuevaNotificacion);

    return () => {
      socket.off("nuevo_mensaje", handleNuevoMensaje);
      socket.off("nueva_notificacion", handleNuevaNotificacion);
    };
  }, [loading, user]);

  const fetchNotificaciones = async () => {
    try {
      setCargandoNotificaciones(true);

      const response = await fetch(
        `${API_URL}/api/notificaciones/mis-notificaciones`,
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

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversaciones/mias`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setUnreadMessagesCount(0);
        return;
      }

      const conversaciones: ConversacionResumen[] = Array.isArray(data) ? data : [];
      const total = conversaciones.reduce(
        (acc, conv) => acc + Number(conv.no_leidos || 0),
        0
      );

      setUnreadMessagesCount(total);
    } catch (error) {
      console.error("Error cargando contador de mensajes:", error);
      setUnreadMessagesCount(0);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/notificaciones/${id}/leer`, {
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
      await fetch(`${API_URL}/api/notificaciones/leer-todas`, {
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

    if (user?.rol === "usuario") {
      router.push("/usuario/notificaciones");
      return;
    }
  };

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  if (loading) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderAvatar = (size = "h-9 w-9", iconSize = 16) => {
    if (fotoPerfilUrl) {
      return (
        <img
          src={fotoPerfilUrl}
          alt="Foto de perfil"
          className={`${size} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`flex ${size} items-center justify-center rounded-full bg-[#9f885c]/15 text-[#22341c]`}
      >
        <User size={iconSize} />
      </div>
    );
  };

  const DesktopNavLinks = () => (
    <nav className="hidden items-center gap-2 lg:flex">
      {navLinksDesktop.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive(link.href)
              ? "bg-[#22341c] text-white shadow-sm"
              : "text-[#4f4a3d] hover:bg-white/70 hover:text-[#22341c]"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="fixed left-0 top-3 z-50 flex w-full justify-center px-3 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-7xl transition-all duration-300 ${
          scrolled ? "translate-y-0" : ""
        }`}
      >
        <div
          className={`rounded-[2rem] border backdrop-blur-xl transition-all duration-300 ${
            scrolled
              ? "border-[#817d58]/18 bg-white/90 px-4 py-3 shadow-[0_16px_40px_rgba(34,52,28,0.12)] md:px-5"
              : "border-white/40 bg-white/72 px-4 py-4 shadow-[0_10px_30px_rgba(34,52,28,0.08)] md:px-6"
          }`}
        >
          {/* MOBILE / TABLET */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/" className="flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 280 }}
                className="relative"
              >
                <Image
                  src="/images/IconoST.png"
                  alt="Solo Terrenos"
                  width={58}
                  height={58}
                  priority
                  className="h-12 w-12 object-contain md:h-14 md:w-14"
                />
              </motion.div>
            </Link>

            <div className="flex min-w-[44px] justify-end">
              {user ? (
                <button
                  type="button"
                  onClick={() => setOpenProfileMenu((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 transition hover:bg-white"
                >
                  {renderAvatar("h-9 w-9", 16)}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-[#817d58]/15 bg-white/80 px-4 py-2 text-sm font-medium text-[#22341c] transition hover:bg-white"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden items-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
            <div className="flex min-w-0 items-center justify-start">
              <DesktopNavLinks />
            </div>

            <div className="flex items-center justify-center">
              <Link href="/" className="group flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.04, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className={`relative rounded-full transition-all duration-300 ${
                    scrolled ? "p-1" : "p-1.5"
                  }`}
                >
                  <Image
                    src="/images/IconoST.png"
                    alt="Solo Terrenos"
                    width={86}
                    height={86}
                    priority
                    className={`w-auto object-contain transition-all duration-300 ${
                      scrolled ? "h-[62px]" : "h-[72px]"
                    }`}
                  />
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2">
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-sm font-medium text-[#4f4a3d] transition hover:bg-white/70 hover:text-[#22341c]"
                  >
                    Ingresar
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-full bg-[#22341c] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#828d4b]"
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
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
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
                        className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
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
                                : "/usuario/notificaciones"
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
                    href="/usuario/favoritos"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
                    title="Favoritos"
                  >
                    <Heart size={18} />
                  </Link>

                  <Link
                    href="/usuario/mensajes"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
                    title="Mensajes"
                  >
                    <MessageCircle size={18} />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#828d4b] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setOpenProfileMenu((prev) => !prev)}
                      className="flex items-center gap-2 rounded-full border border-[#817d58]/15 bg-white/80 px-2.5 py-2 text-[#22341c] transition hover:bg-white"
                    >
                      {renderAvatar()}
                      <ChevronDown size={16} />
                    </button>

                    <AnimatePresence>
                      {openProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          className="absolute right-0 top-14 z-50 w-[280px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
                        >
                          <div className="border-b border-[#817d58]/12 px-4 py-4">
                            <div className="flex items-center gap-3">
                              {renderAvatar("h-12 w-12", 20)}

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#22341c]">
                                  {user?.nombre || "Usuario"}
                                </p>
                                <p className="text-xs uppercase tracking-[0.12em] text-[#817d58]">
                                  Usuario
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              href="/usuario"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <LayoutGrid size={16} />
                              Mi cuenta
                            </Link>

                            <Link
                              href="/usuario/perfil"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <User size={16} />
                              Mi perfil
                            </Link>

                            <Link
                              href="/usuario/favoritos"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <Heart size={16} />
                              Favoritos
                            </Link>

                            <Link
                              href="/usuario/mensajes"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <MessageCircle size={16} />
                              Mensajes
                            </Link>

                            <Link
                              href="/planes"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <BadgeCheck size={16} />
                              Planes
                            </Link>

                            <Link
                              href="/usuario/configuracion"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <Settings size={16} />
                              Configuración
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

              {user?.rol === "colaborador" && (
                <>
                  <Link
                    href="/publicar"
                    className="inline-flex items-center gap-2 rounded-full bg-[#22341c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                  >
                    <PlusCircle size={16} />
                    Publicar
                  </Link>

                  <Link
                    href="/colaborador/mensajes"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
                    title="Mensajes"
                  >
                    <MessageCircle size={18} />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#828d4b] px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/colaborador"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/80 text-[#22341c] transition hover:bg-white"
                    title="Panel"
                  >
                    <LayoutGrid size={18} />
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setOpenProfileMenu((prev) => !prev)}
                      className="flex items-center gap-2 rounded-full border border-[#817d58]/15 bg-white/80 px-2.5 py-2 text-[#22341c] transition hover:bg-white"
                    >
                      {renderAvatar()}
                      <ChevronDown size={16} />
                    </button>

                    <AnimatePresence>
                      {openProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          className="absolute right-0 top-14 z-50 w-[280px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
                        >
                          <div className="border-b border-[#817d58]/12 px-4 py-4">
                            <div className="flex items-center gap-3">
                              {renderAvatar("h-12 w-12", 20)}

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
                              href="/colaborador/configuracion"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <Settings size={16} />
                              Configuración
                            </Link>

                            <Link
                              href="/suscripciones"
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

              {user?.rol === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-full bg-[#22341c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                  >
                    <ShieldCheck size={16} />
                    CRM
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setOpenProfileMenu((prev) => !prev)}
                      className="flex items-center gap-2 rounded-full border border-[#817d58]/15 bg-white/80 px-2.5 py-2 text-[#22341c] transition hover:bg-white"
                    >
                      {renderAvatar()}
                      <ChevronDown size={16} />
                    </button>

                    <AnimatePresence>
                      {openProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          className="absolute right-0 top-14 z-50 w-[280px] overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white shadow-2xl"
                        >
                          <div className="border-b border-[#817d58]/12 px-4 py-4">
                            <div className="flex items-center gap-3">
                              {renderAvatar("h-12 w-12", 20)}

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#22341c]">
                                  {user?.nombre || "Administrador"}
                                </p>
                                <p className="text-xs uppercase tracking-[0.12em] text-[#817d58]">
                                  Administrador
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              href="/admin"
                              onClick={() => setOpenProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#22341c] transition hover:bg-[#f7f6f1]"
                            >
                              <LayoutGrid size={16} />
                              Volver al CRM
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
          </div>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-4 rounded-[1.8rem] border border-[#817d58]/12 bg-white p-5 shadow-xl lg:hidden"
              >
                <div className="flex flex-col gap-2">
                  {navLinksMobile.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive(link.href)
                          ? "bg-[#22341c] text-white"
                          : "text-[#22341c] hover:bg-[#f7f6f1]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {!user && (
                    <>
                      <div className="my-2 h-px bg-[#817d58]/12" />

                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Ingresar
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl bg-[#22341c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}

                  {user?.rol === "usuario" && (
                    <>
                      <div className="my-2 h-px bg-[#817d58]/12" />

                      <Link
                        href="/usuario"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Mi cuenta
                      </Link>

                      <Link
                        href="/usuario/favoritos"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Favoritos
                      </Link>

                      <Link
                        href="/usuario/mensajes"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Mensajes {unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ""}
                      </Link>

                      <Link
                        href="/usuario/notificaciones"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Notificaciones {totalNoLeidas > 0 ? `(${totalNoLeidas})` : ""}
                      </Link>

                      <Link
                        href="/usuario/perfil"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Mi perfil
                      </Link>

                      <Link
                        href="/usuario/configuracion"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Configuración
                      </Link>
                    </>
                  )}

                  {user?.rol === "colaborador" && (
                    <>
                      <div className="my-2 h-px bg-[#817d58]/12" />

                      <Link
                        href="/publicar"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl bg-[#22341c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                      >
                        Publicar
                      </Link>

                      <Link
                        href="/colaborador/mensajes"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Mensajes {unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ""}
                      </Link>

                      <Link
                        href="/colaborador/notificaciones"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Notificaciones {totalNoLeidas > 0 ? `(${totalNoLeidas})` : ""}
                      </Link>

                      <Link
                        href="/colaborador/perfil"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Mi perfil
                      </Link>

                      <Link
                        href="/colaborador/configuracion"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Configuración
                      </Link>

                      <Link
                        href="/colaborador"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                      >
                        Panel
                      </Link>
                    </>
                  )}

                  {user?.rol === "admin" && (
                    <>
                      <div className="my-2 h-px bg-[#817d58]/12" />

                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl bg-[#22341c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                      >
                        Volver al CRM
                      </Link>
                    </>
                  )}

                  {user && (
                    <>
                      <div className="my-2 h-px bg-[#817d58]/12" />
                      <button
                        onClick={handleLogout}
                        className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </header>
  );
}