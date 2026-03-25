"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  Bell,
  User,
  ChevronRight,
  Search,
  MapPinned,
  Clock3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_URL = "http://localhost:5000";

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creado_en: string;
  metadata?: any;
}

interface ConversacionResumen {
  id: number;
  nombre_terreno?: string;
  ultimo_mensaje?: string;
  actualizado_en?: string;
}

interface FavoritoResumen {
  id: number;
  terreno_id: number;
  titulo: string;
  ubicacion: string;
  precio: number | string;
  imagen_principal?: string | null;
}

export default function UsuarioDashboardPage() {
  const { user, loading } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>([]);
  const [favoritos, setFavoritos] = useState<FavoritoResumen[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    inicializarDashboard();
  }, [loading, user]);

  const inicializarDashboard = async () => {
    try {
      setCargando(true);

      await Promise.all([
        fetchNotificaciones(),
        fetchConversaciones(),
        fetchFavoritos(),
      ]);
    } catch (error) {
      console.error("Error cargando dashboard de usuario:", error);
    } finally {
      setCargando(false);
    }
  };

  const fetchNotificaciones = async () => {
    try {
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

      setNotificaciones(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setNotificaciones([]);
    }
  };

  const fetchConversaciones = async () => {
    try {
      // Ajusta esta ruta si tu endpoint real es diferente
      const response = await fetch(
        `${API_URL}/api/conversaciones/mis-conversaciones`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setConversaciones([]);
        return;
      }

      setConversaciones(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      setConversaciones([]);
    }
  };

  const fetchFavoritos = async () => {
    try {
      // Ajusta esta ruta si tu endpoint real es diferente
      const response = await fetch(`${API_URL}/api/favoritos/mis-favoritos`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setFavoritos([]);
        return;
      }

      setFavoritos(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
      setFavoritos([]);
    }
  };

  const totalNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "Sin fecha";
    try {
      return new Date(fecha).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  if (loading || cargando) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando panel de usuario...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#22341c]">
              <User size={14} />
              Panel del usuario
            </div>

            <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
              Hola, {user?.nombre || "usuario"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#817d58] md:text-base">
              Administra tus favoritos, conversaciones y actividad reciente como
              comprador dentro de SoloTerrenos.
            </p>
          </div>

          <Link
            href="/terrenos"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
          >
            <Search size={16} />
            Explorar terrenos
          </Link>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <Heart className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Favoritos guardados</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {favoritos.length}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <MessageCircle className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Conversaciones recientes</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {conversaciones.length}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <Bell className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Notificaciones</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {notificaciones.length}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <Clock3 className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Pendientes por revisar</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {totalNoLeidas}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#22341c]">
                  Conversaciones recientes
                </h2>
                <p className="mt-1 text-sm text-[#817d58]">
                  Continúa tus conversaciones con vendedores y colaboradores.
                </p>
              </div>

              <Link
                href="/usuario/mensajes"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
              >
                Ver inbox
                <ChevronRight size={16} />
              </Link>
            </div>

            {conversaciones.length === 0 ? (
              <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                Aún no tienes conversaciones activas. Cuando contactes un terreno,
                aquí aparecerá tu historial de mensajes.
              </div>
            ) : (
              <div className="space-y-3">
                {conversaciones.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/usuario/mensajes?conversacion=${conv.id}`}
                    className="block rounded-2xl bg-[#faf9f5] p-4 transition hover:bg-[#f2efe6]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#22341c]">
                          {conv.nombre_terreno || "Conversación"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#817d58]">
                          {conv.ultimo_mensaje || "Sin mensajes recientes"}
                        </p>
                      </div>

                      <MessageCircle
                        size={18}
                        className="shrink-0 text-[#9f885c]"
                      />
                    </div>

                    <p className="mt-3 text-xs text-[#9f885c]">
                      {formatFecha(conv.actualizado_en)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#22341c]">Notificaciones</h3>
                  <p className="text-sm text-[#817d58]">
                    Resumen de actividad reciente en tu cuenta.
                  </p>
                </div>

                <Link
                  href="/usuario/notificaciones"
                  className="text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver todas
                </Link>
              </div>

              {notificaciones.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-4 text-sm text-[#817d58]">
                  No tienes notificaciones recientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificaciones.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        item.leida
                          ? "border-[#817d58]/10 bg-[#faf9f5]"
                          : "border-[#9f885c]/20 bg-[#f7f6f1]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell
                          size={16}
                          className="mt-0.5 shrink-0 text-[#22341c]"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#22341c]">
                            {item.titulo}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-[#817d58]">
                            {item.mensaje}
                          </p>
                          <p className="mt-2 text-[11px] text-[#9f885c]">
                            {formatFecha(item.creado_en)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#22341c]">Accesos rápidos</h3>
                  <p className="text-sm text-[#817d58]">
                    Continúa tus acciones más frecuentes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/usuario/favoritos"
                  className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3 transition hover:bg-[#f2efe6]"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} className="text-[#22341c]" />
                    <span className="text-sm font-medium text-[#22341c]">
                      Ver favoritos
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-[#817d58]" />
                </Link>

                <Link
                  href="/usuario/perfil"
                  className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3 transition hover:bg-[#f2efe6]"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-[#22341c]" />
                    <span className="text-sm font-medium text-[#22341c]">
                      Mi perfil
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-[#817d58]" />
                </Link>

                <Link
                  href="/terrenos"
                  className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3 transition hover:bg-[#f2efe6]"
                >
                  <div className="flex items-center gap-3">
                    <MapPinned size={16} className="text-[#22341c]" />
                    <span className="text-sm font-medium text-[#22341c]">
                      Seguir explorando
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-[#817d58]" />
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#22341c]">
                Favoritos recientes
              </h2>
              <p className="mt-1 text-sm text-[#817d58]">
                Tus terrenos guardados para revisar después.
              </p>
            </div>

            <Link
              href="/usuario/favoritos"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          {favoritos.length === 0 ? (
            <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
              Todavía no has guardado terrenos en favoritos. Explora propiedades
              y guarda las que más te interesen.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {favoritos.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/terrenos/${fav.terreno_id}`}
                  className="overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="h-40 w-full bg-[#e8e3d6]">
                    {fav.imagen_principal ? (
                      <img
                        src={`${API_URL}${fav.imagen_principal}`}
                        alt={fav.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#817d58]">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-1 font-semibold text-[#22341c]">
                      {fav.titulo}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-[#817d58]">
                      {fav.ubicacion}
                    </p>
                    <p className="mt-3 text-lg font-bold text-[#22341c]">
                      ${Number(fav.precio).toLocaleString("es-MX")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}