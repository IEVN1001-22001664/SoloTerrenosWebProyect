"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  MapPinned,
  Clock3,
  ShieldCheck,
  PauseCircle,
  XCircle,
  MessageCircle,
  Bell,
  Users,
  PlusCircle,
  ArrowRight,
  FileWarning,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
interface Terreno {
  id: number;
  titulo: string;
  estado: string;
  precio?: string | number;
  municipio?: string;
  estado_region?: string;
  imagen_principal?: string;
  ultima_revision_mensaje?: string;
  ultima_revision_fecha?: string;
  creado_en?: string;
}

interface Lead {
  lead_id: number;
  terreno_id: number;
  nombre_contacto: string;
  email_contacto: string;
  mensaje?: string;
  creado_en: string;
  terreno_titulo: string;
  conversacion_id?: number;
}

interface Conversacion {
  conversacion_id: number;
  terreno_titulo: string;
  contacto_nombre: string;
  contacto_apellido?: string;
  ultimo_mensaje?: string;
  ultimo_mensaje_en?: string;
  no_leidos?: string | number;
}

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creado_en: string;
}

export default function ColaboradorDashboardPage() {
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setCargando(true);

        const [resTerrenos, resLeads, resConversaciones, resNotificaciones] =
          await Promise.all([
            fetch(`${API_URL}/api/terrenos/mis-terrenos`, {
              credentials: "include",
            }),
            fetch(`${API_URL}/api/leads/mis-leads`, {
              credentials: "include",
            }),
            fetch(`${API_URL}/api/conversaciones/mias`, {
              credentials: "include",
            }),
            fetch(`${API_URL}/api/notificaciones/mis-notificaciones`, {
              credentials: "include",
            }),
          ]);

        const [
          dataTerrenos,
          dataLeads,
          dataConversaciones,
          dataNotificaciones,
        ] = await Promise.all([
          resTerrenos.json(),
          resLeads.json(),
          resConversaciones.json(),
          resNotificaciones.json(),
        ]);

        setTerrenos(resTerrenos.ok ? dataTerrenos : []);
        setLeads(resLeads.ok ? dataLeads : []);
        setConversaciones(resConversaciones.ok ? dataConversaciones : []);
        setNotificaciones(resNotificaciones.ok ? dataNotificaciones : []);
      } catch (error) {
        console.error("Error cargando dashboard colaborador:", error);
        setTerrenos([]);
        setLeads([]);
        setConversaciones([]);
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  const resumen = useMemo(() => {
    const total = terrenos.length;
    const aprobados = terrenos.filter((t) => t.estado === "aprobado").length;
    const pendientes = terrenos.filter((t) => t.estado === "pendiente").length;
    const pausados = terrenos.filter((t) => t.estado === "pausado").length;
    const rechazados = terrenos.filter((t) => t.estado === "rechazado").length;
    const noLeidas = notificaciones.filter((n) => !n.leida).length;
    const mensajesNoLeidos = conversaciones.reduce(
      (acc, c) => acc + Number(c.no_leidos || 0),
      0
    );

    return {
      total,
      aprobados,
      pendientes,
      pausados,
      rechazados,
      noLeidas,
      mensajesNoLeidos,
      leads: leads.length,
    };
  }, [terrenos, leads, conversaciones, notificaciones]);

  const terrenosAtencion = useMemo(
    () =>
      terrenos
        .filter((t) => t.estado === "rechazado" || t.estado === "pendiente")
        .slice(0, 4),
    [terrenos]
  );

  const leadsRecientes = useMemo(() => leads.slice(0, 4), [leads]);
  const mensajesRecientes = useMemo(() => conversaciones.slice(0, 4), [conversaciones]);
  const notificacionesRecientes = useMemo(
    () => notificaciones.slice(0, 5),
    [notificaciones]
  );

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getImageUrl = (img?: string) => {
    if (!img) return "https://via.placeholder.com/400x260?text=Terreno";
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

  const getEstadoPill = (estado: string) => {
    const e = (estado || "").toLowerCase();

    if (e === "aprobado") {
      return "bg-green-100 text-green-700";
    }

    if (e === "pendiente") {
      return "bg-[#9f885c]/15 text-[#817d58]";
    }

    if (e === "rechazado") {
      return "bg-red-100 text-red-700";
    }

    if (e === "pausado") {
      return "bg-slate-100 text-slate-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando centro de control...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* encabezado */}
        <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#22341c]">
              <LayoutGrid size={14} />
              Centro de control
            </div>

            <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
              Dashboard del colaborador
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#817d58] md:text-base">
              Supervisa tus publicaciones, oportunidades comerciales y actividad
              reciente desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 rounded-xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
            >
              <PlusCircle size={16} />
              Publicar terreno
            </Link>

            <Link
              href="/colaborador/misTerrenos"
              className="inline-flex items-center gap-2 rounded-xl border border-[#817d58]/20 bg-white px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f4f2ea]"
            >
              Ver mis terrenos
            </Link>
          </div>
        </section>

        {/* resumen principal */}
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <MapPinned size={20} className="text-[#22341c]" />
            </div>
            <p className="text-sm text-[#817d58]">Total de terrenos</p>
            <p className="mt-1 text-3xl font-bold text-[#22341c]">
              {resumen.total}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <ShieldCheck size={20} className="text-green-700" />
            </div>
            <p className="text-sm text-[#817d58]">Aprobados</p>
            <p className="mt-1 text-3xl font-bold text-[#22341c]">
              {resumen.aprobados}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <Clock3 size={20} className="text-[#22341c]" />
            </div>
            <p className="text-sm text-[#817d58]">Pendientes de revisión</p>
            <p className="mt-1 text-3xl font-bold text-[#22341c]">
              {resumen.pendientes}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100">
              <FileWarning size={20} className="text-red-700" />
            </div>
            <p className="text-sm text-[#817d58]">Requieren corrección</p>
            <p className="mt-1 text-3xl font-bold text-[#22341c]">
              {resumen.rechazados}
            </p>
          </div>
        </section>

        {/* métricas secundarias */}
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Pausados</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {resumen.pausados}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Leads recibidos</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {resumen.leads}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Mensajes sin leer</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {resumen.mensajesNoLeidos}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Notificaciones nuevas</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {resumen.noLeidas}
            </p>
          </div>
        </section>

        {/* acciones rápidas */}
        <section className="mb-8 rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#22341c]">
                Accesos rápidos
              </h2>
              <p className="mt-1 text-sm text-[#817d58]">
                Navega rápido a los módulos principales.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/colaborador/misTerrenos"
              className="rounded-2xl border border-[#817d58]/12 bg-[#faf9f5] p-5 transition hover:-translate-y-1 hover:shadow-sm"
            >
              <MapPinned className="mb-4 text-[#22341c]" size={22} />
              <h3 className="font-semibold text-[#22341c]">Mis terrenos</h3>
              <p className="mt-1 text-sm text-[#817d58]">
                Administra todas tus publicaciones.
              </p>
            </Link>

            <Link
              href="/colaborador/leads"
              className="rounded-2xl border border-[#817d58]/12 bg-[#faf9f5] p-5 transition hover:-translate-y-1 hover:shadow-sm"
            >
              <Users className="mb-4 text-[#22341c]" size={22} />
              <h3 className="font-semibold text-[#22341c]">Leads</h3>
              <p className="mt-1 text-sm text-[#817d58]">
                Revisa los interesados en tus terrenos.
              </p>
            </Link>

            <Link
              href="/colaborador/mensajes"
              className="rounded-2xl border border-[#817d58]/12 bg-[#faf9f5] p-5 transition hover:-translate-y-1 hover:shadow-sm"
            >
              <MessageCircle className="mb-4 text-[#22341c]" size={22} />
              <h3 className="font-semibold text-[#22341c]">Mensajes</h3>
              <p className="mt-1 text-sm text-[#817d58]">
                Da seguimiento a tus conversaciones.
              </p>
            </Link>

            <Link
              href="/colaborador/notificaciones"
              className="rounded-2xl border border-[#817d58]/12 bg-[#faf9f5] p-5 transition hover:-translate-y-1 hover:shadow-sm"
            >
              <Bell className="mb-4 text-[#22341c]" size={22} />
              <h3 className="font-semibold text-[#22341c]">Notificaciones</h3>
              <p className="mt-1 text-sm text-[#817d58]">
                Mantente al tanto de cambios y actividad.
              </p>
            </Link>
          </div>
        </section>

        {/* grid central */}
        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          {/* izquierda */}
          <div className="space-y-6">
            {/* publicaciones que requieren atención */}
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#22341c]">
                    Publicaciones que requieren atención
                  </h2>
                  <p className="mt-1 text-sm text-[#817d58]">
                    Revisa las que están pendientes o requieren corrección.
                  </p>
                </div>

                <Link
                  href="/colaborador/misTerrenos"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver todas
                  <ArrowRight size={16} />
                </Link>
              </div>

              {terrenosAtencion.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                  No hay publicaciones que requieran atención inmediata.
                </div>
              ) : (
                <div className="space-y-4">
                  {terrenosAtencion.map((terreno) => (
                    <div
                      key={terreno.id}
                      className="grid gap-4 rounded-2xl border border-[#817d58]/12 p-4 md:grid-cols-[120px_1fr]"
                    >
                      <img
                        src={getImageUrl(terreno.imagen_principal)}
                        alt={terreno.titulo}
                        className="h-28 w-full rounded-xl object-cover"
                      />

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#22341c]">
                            {terreno.titulo}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getEstadoPill(
                              terreno.estado
                            )}`}
                          >
                            {terreno.estado}
                          </span>
                        </div>

                        <p className="text-sm text-[#817d58]">
                          {[terreno.municipio, terreno.estado_region]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {terreno.estado === "rechazado" &&
                          terreno.ultima_revision_mensaje && (
                            <p className="mt-3 line-clamp-2 text-sm text-[#4f4a3d]">
                              {terreno.ultima_revision_mensaje}
                            </p>
                          )}

                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={`/colaborador/misTerrenos/${terreno.id}/editar`}
                            className="rounded-xl bg-[#22341c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#828d4b]"
                          >
                            {terreno.estado === "rechazado"
                              ? "Editar y reenviar"
                              : "Editar"}
                          </Link>

                          <Link
                            href="/colaborador/misTerrenos"
                            className="rounded-xl border border-[#817d58]/20 px-4 py-2 text-sm font-medium text-[#22341c] transition hover:bg-[#f4f2ea]"
                          >
                            Ver en mis terrenos
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* leads recientes */}
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#22341c]">
                    Leads recientes
                  </h2>
                  <p className="mt-1 text-sm text-[#817d58]">
                    Usuarios que mostraron interés recientemente.
                  </p>
                </div>

                <Link
                  href="/colaborador/leads"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver todos
                  <ArrowRight size={16} />
                </Link>
              </div>

              {leadsRecientes.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                  Aún no has recibido leads.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadsRecientes.map((lead) => (
                    <div
                      key={lead.lead_id}
                      className="rounded-2xl border border-[#817d58]/12 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-[#22341c]">
                            {lead.nombre_contacto}
                          </p>
                          <p className="mt-1 text-sm text-[#817d58]">
                            {lead.terreno_titulo}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-[#4f4a3d]">
                            {lead.mensaje || "Sin mensaje inicial."}
                          </p>
                        </div>

                        <div className="text-xs text-[#817d58]">
                          {formatFecha(lead.creado_en)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* derecha */}
          <div className="space-y-6">
            {/* mensajes recientes */}
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#22341c]">
                    Conversaciones activas
                  </h2>
                  <p className="mt-1 text-sm text-[#817d58]">
                    Mantén el seguimiento comercial.
                  </p>
                </div>

                <Link
                  href="/colaborador/mensajes"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver inbox
                  <ArrowRight size={16} />
                </Link>
              </div>

              {mensajesRecientes.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                  No hay conversaciones activas.
                </div>
              ) : (
                <div className="space-y-3">
                  {mensajesRecientes.map((conv) => (
                    <Link
                      key={conv.conversacion_id}
                      href={`/colaborador/mensajes?conversacion=${conv.conversacion_id}`}
                      className="block rounded-2xl border border-[#817d58]/12 p-4 transition hover:bg-[#faf9f5]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#22341c]">
                            {conv.contacto_nombre} {conv.contacto_apellido || ""}
                          </p>
                          <p className="mt-1 line-clamp-1 text-sm text-[#817d58]">
                            {conv.terreno_titulo}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-[#4f4a3d]">
                            {conv.ultimo_mensaje || "Sin mensajes"}
                          </p>
                        </div>

                        {Number(conv.no_leidos || 0) > 0 && (
                          <span className="rounded-full bg-[#828d4b] px-2 py-1 text-xs font-bold text-white">
                            {conv.no_leidos}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* notificaciones recientes */}
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#22341c]">
                    Actividad reciente
                  </h2>
                  <p className="mt-1 text-sm text-[#817d58]">
                    Últimas notificaciones de tu cuenta.
                  </p>
                </div>

                <Link
                  href="/colaborador/notificaciones"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#22341c] transition hover:text-[#828d4b]"
                >
                  Ver todas
                  <ArrowRight size={16} />
                </Link>
              </div>

              {notificacionesRecientes.length === 0 ? (
                <div className="rounded-2xl bg-[#faf9f5] p-6 text-sm text-[#817d58]">
                  No hay notificaciones recientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {notificacionesRecientes.map((noti) => (
                    <div
                      key={noti.id}
                      className={`rounded-2xl border p-4 ${
                        noti.leida
                          ? "border-[#817d58]/12"
                          : "border-[#828d4b]/25 bg-[#f8f7ef]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#22341c]">
                            {noti.titulo}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-[#4f4a3d]">
                            {noti.mensaje}
                          </p>
                        </div>

                        {!noti.leida && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#828d4b]" />
                        )}
                      </div>

                      <p className="mt-3 text-xs text-[#817d58]">
                        {formatFecha(noti.creado_en)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}