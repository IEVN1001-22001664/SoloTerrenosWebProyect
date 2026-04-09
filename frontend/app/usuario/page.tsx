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
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/src/lib/socket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  conversacion_id: number;
  lead_id: number;
  terreno_id: number;
  comprador_id: number;
  vendedor_id: number;
  estado: string;
  creado_en: string;
  actualizado_en: string;
  ultimo_mensaje_en: string;
  terreno_titulo: string;
  terreno_precio: string;
  municipio?: string;
  estado_region?: string;
  imagen_principal?: string;
  contacto_id: number;
  contacto_nombre: string;
  contacto_apellido?: string;
  contacto_email?: string;
  ultimo_mensaje?: string;
  no_leidos?: string | number;
}

interface FavoritoResumen {
  id: number;
  terreno_id: number;
  titulo: string;
  ubicacion: string;
  precio: number | string;
  imagen_principal?: string | null;
  tipo?: string;
  fecha_guardado?: string;
}

interface TerrenoImagen {
  id?: number;
  url?: string;
  ruta?: string;
}

async function getTerrenoImagenes(id: string): Promise<TerrenoImagen[]> {
  try {
    const res = await fetch(`${API_URL}/api/terrenos/${id}/imagenes`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data?.imagenes) ? data.imagenes : [];
  } catch (error) {
    console.error("Error al obtener imágenes del terreno:", error);
    return [];
  }
}

function getImagenUrl(img?: string | null) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img}`;
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

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleNuevoMensaje = () => {
      fetchConversaciones();
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

      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setNotificaciones([]);
    }
  };

  const fetchConversaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/api/conversaciones/mias`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setConversaciones([]);
        return;
      }

      const lista = Array.isArray(data) ? data : [];
      setConversaciones(lista);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      setConversaciones([]);
    }
  };

  const fetchFavoritos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favoritos/mis-favoritos`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setFavoritos([]);
        return;
      }

      const favoritosBase: FavoritoResumen[] = Array.isArray(data) ? data : [];

      const favoritosConImagen = await Promise.all(
        favoritosBase.map(async (favorito) => {
          const imagenes = await getTerrenoImagenes(String(favorito.terreno_id));

          return {
            ...favorito,
            imagen_principal:
              imagenes.length > 0
                ? imagenes[0].url || imagenes[0].ruta || null
                : favorito.imagen_principal || null,
          };
        })
      );

      setFavoritos(favoritosConImagen);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
      setFavoritos([]);
    }
  };

  const totalNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  const totalMensajesNoLeidos = useMemo(
    () =>
      conversaciones.reduce(
        (acc, conv) => acc + Number(conv.no_leidos || 0),
        0
      ),
    [conversaciones]
  );

  const notificacionesRecientes = useMemo(
    () => notificaciones.slice(0, 5),
    [notificaciones]
  );

  const conversacionesRecientes = useMemo(
    () => conversaciones.slice(0, 4),
    [conversaciones]
  );

  const favoritosRecientes = useMemo(
    () => favoritos.slice(0, 4),
    [favoritos]
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

  const formatUbicacionConversacion = (conv: ConversacionResumen) => {
    return [conv.municipio, conv.estado_region].filter(Boolean).join(", ");
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
              <LayoutGrid size={14} />
              Centro de control
            </div>

            <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
              Hola, {user?.nombre || "usuario"}
            </h1>

           <p className="mt-2 max-w-2xl text-sm text-[#817d58] md:text-base hidden sm:block">
              Revisa de forma rápida tus terrenos guardados, mensajes activos y
              actividad reciente dentro de SoloTerrenos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/terrenos"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
            >
              <Search size={16} />
              Explorar terrenos
            </Link>

            <Link
              href="/usuario/favoritos"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#817d58]/15 bg-white px-5 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f7f6f1]"
            >
              <Heart size={16} />
              Mis favoritos
            </Link>
          </div>
        </section>

        <section className="mb-8">
          {/* Vista móvil compacta */}
          <div className="grid grid-cols-4 gap-3 md:hidden">
            <Link href="/usuario/favoritos" className="block">
              <div className="rounded-[1.2rem] border border-[#817d58]/12 bg-white p-3 shadow-sm transition active:scale-95">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#9f885c]/15">
                  <Heart className="text-[#22341c]" size={15} />
                </div>
                <p className="text-3xl font-bold leading-none text-[#22341c]">
                  {favoritos.length}
                </p>
              </div>
            </Link>

            <Link href="/usuario/mensajes" className="block">
              <div className="rounded-[1.2rem] border border-[#817d58]/12 bg-white p-3 shadow-sm transition active:scale-95">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#9f885c]/15">
                  <MessageCircle className="text-[#22341c]" size={15} />
                </div>
                <p className="text-3xl font-bold leading-none text-[#22341c]">
                  {conversaciones.length}
                </p>
              </div>
            </Link>

            <Link href="/usuario/notificaciones" className="block">
              <div className="rounded-[1.2rem] border border-[#817d58]/12 bg-white p-3 shadow-sm transition active:scale-95">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#9f885c]/15">
                  <Bell className="text-[#22341c]" size={15} />
                </div>
                <p className="text-3xl font-bold leading-none text-[#22341c]">
                  {totalNoLeidas}
                </p>
              </div>
            </Link>

            <Link href="/usuario/mensajes" className="block">
              <div className="rounded-[1.2rem] border border-[#817d58]/12 bg-white p-3 shadow-sm transition active:scale-95">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#9f885c]/15">
                  <Clock3 className="text-[#22341c]" size={15} />
                </div>
                <p className="text-3xl font-bold leading-none text-[#22341c]">
                  {totalMensajesNoLeidos}
                </p>
              </div>
            </Link>
          </div>

          {/* Vista tablet / desktop */}
          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
            <Link href="/usuario/favoritos">
              <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                  <Heart className="text-[#22341c]" size={20} />
                </div>
                <p className="text-sm text-[#817d58]">Favoritos guardados</p>
                <p className="mt-2 text-2xl font-bold text-[#22341c]">
                  {favoritos.length}
                </p>
              </div>
            </Link>
            
            <Link href="/usuario/mensajes">
            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <MessageCircle className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Conversaciones activas</p>
              <p className="mt-2 text-2xl font-bold text-[#22341c]">
                {conversaciones.length}
              </p>
            </div>
            </Link>

             <Link href="/usuario/notificaciones">
            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <Bell className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Notificaciones nuevas</p>
              <p className="mt-2 text-2xl font-bold text-[#22341c]">
                {totalNoLeidas}
              </p>
            </div>
            </Link>

            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <Clock3 className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Mensajes por revisar</p>
              <p className="mt-2 text-2xl font-bold text-[#22341c]">
                {totalMensajesNoLeidos}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#22341c]">
                  Conversaciones recientes
                </h2>
                <p className="mt-1 text-sm text-[#817d58]">
                  Continúa tus conversaciones con vendedores.
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

            {conversacionesRecientes.length === 0 ? (
              <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                Aún no tienes conversaciones activas. Cuando contactes un terreno,
                aquí aparecerán tus chats recientes.
              </div>
            ) : (
              <div className="space-y-3">
                {conversacionesRecientes.map((conv) => {
                  const ubicacion = formatUbicacionConversacion(conv);

                  return (
                    <Link
                      key={conv.conversacion_id}
                      href={`/usuario/mensajes?conversacion=${conv.conversacion_id}`}
                      className="block rounded-2xl bg-[#faf9f5] p-4 transition hover:bg-[#f2efe6]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-[#22341c]">
                            {conv.contacto_nombre} {conv.contacto_apellido || ""}
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm text-[#817d58]">
                            {conv.terreno_titulo || "Conversación"}
                          </p>

                          {ubicacion && (
                            <p className="mt-1 line-clamp-1 text-xs text-[#9f885c]">
                              {ubicacion}
                            </p>
                          )}

                          <p className="mt-2 line-clamp-2 text-sm text-[#817d58]">
                            {conv.ultimo_mensaje || "Sin mensajes recientes"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {Number(conv.no_leidos || 0) > 0 && (
                            <span className="rounded-full bg-[#828d4b] px-2 py-0.5 text-xs font-semibold text-white">
                              {conv.no_leidos}
                            </span>
                          )}

                          <MessageCircle
                            size={18}
                            className="shrink-0 text-[#9f885c]"
                          />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-[#9f885c]">
                        {formatFecha(conv.ultimo_mensaje_en || conv.actualizado_en)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#22341c]">Notificaciones</h3>
                  <p className="text-sm text-[#817d58]">
                    Resumen reciente de tu actividad.
                  </p>
                </div>

                <Link
                  href="/usuario/notificaciones"
                  className="text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver todas
                </Link>
              </div>

              {notificacionesRecientes.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-4 text-sm text-[#817d58]">
                  No tienes notificaciones recientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificacionesRecientes.map((item) => (
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
              <div className="mb-5">
                <h3 className="font-semibold text-[#22341c]">Accesos rápidos</h3>
                <p className="text-sm text-[#817d58]">
                  Continúa tus acciones más frecuentes.
                </p>
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
                  href="/usuario/mensajes"
                  className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3 transition hover:bg-[#f2efe6]"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={16} className="text-[#22341c]" />
                    <span className="text-sm font-medium text-[#22341c]">
                      Abrir mensajes
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

          {favoritosRecientes.length === 0 ? (
            <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
              Todavía no has guardado terrenos en favoritos. Explora propiedades
              y guarda las que más te interesen.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {favoritosRecientes.map((fav) => {
                const imagen = getImagenUrl(fav.imagen_principal);

                return (
                  <Link
                    key={fav.id}
                    href={`/terrenos/${fav.terreno_id}`}
                    className="overflow-hidden rounded-[1.5rem] border border-[#817d58]/12 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-40 w-full bg-[#e8e3d6]">
                      {imagen ? (
                        <img
                          src={imagen}
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
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}