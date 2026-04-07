"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Clock3,
  CheckCircle2,
  PauseCircle,
  Trash2,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import CambiarEstadoPublicacionModal from "./cambiarEstadoPublicacionModal";

interface Publicacion {
  id: number;
  titulo: string;
  estado: string;
  creado_en: string;
  usuario: string;
}

type FiltroEstado =
  | "todos"
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "pausado";

export default function PublicacionesTable() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [accionCargando, setAccionCargando] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] =
    useState<Publicacion | null>(null);
  const [estadoDestino, setEstadoDestino] = useState("");
  const [requiereMensaje, setRequiereMensaje] = useState(false);

  const fetchPublicaciones = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await apiFetch("/api/admin/publicaciones");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
      setError("No fue posible cargar las publicaciones.");
      setPublicaciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const abrirModalCambioEstado = (
    publicacion: Publicacion,
    nuevoEstado: string,
    necesitaMensaje = false
  ) => {
    setPublicacionSeleccionada(publicacion);
    setEstadoDestino(nuevoEstado);
    setRequiereMensaje(necesitaMensaje);
    setModalOpen(true);
  };

  const confirmarCambioEstado = async (mensaje: string) => {
    if (!publicacionSeleccionada || !estadoDestino) return;

    try {
      setAccionCargando(`estado-${publicacionSeleccionada.id}`);

      await apiFetch(`/api/admin/publicaciones/${publicacionSeleccionada.id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({
          estado: estadoDestino,
          mensaje: mensaje || undefined,
        }),
      });

      setModalOpen(false);
      setPublicacionSeleccionada(null);
      setEstadoDestino("");
      setRequiereMensaje(false);

      await fetchPublicaciones();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      setError("No fue posible cambiar el estado de la publicación.");
    } finally {
      setAccionCargando(null);
    }
  };

  const eliminarPublicacion = async (id: number) => {
    const confirmado = window.confirm(
      "¿Enviar esta publicación a borrados?"
    );
    if (!confirmado) return;

    try {
      setAccionCargando(`delete-${id}`);

      await apiFetch(`/api/admin/publicaciones/${id}`, {
        method: "DELETE",
      });

      await fetchPublicaciones();
    } catch (error) {
      console.error("Error eliminando publicación:", error);
      setError("No fue posible enviar la publicación a borrados.");
    } finally {
      setAccionCargando(null);
    }
  };

  const publicacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return publicaciones.filter((item) => {
      const idTexto = String(item.id);
      const titulo = (item.titulo || "").toLowerCase();
      const usuario = (item.usuario || "").toLowerCase();
      const estado = (item.estado || "").toLowerCase();

      const coincideBusqueda =
        !q ||
        idTexto.includes(q) ||
        titulo.includes(q) ||
        usuario.includes(q);

      const coincideEstado =
        filtroEstado === "todos" ? true : estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [publicaciones, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    return {
      total: publicaciones.length,
      pendientes: publicaciones.filter((p) => p.estado === "pendiente").length,
      aprobadas: publicaciones.filter((p) => p.estado === "aprobado").length,
      rechazadas: publicaciones.filter((p) => p.estado === "rechazado").length,
    };
  }, [publicaciones]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderEstado = (estado: string) => {
    const e = estado.toLowerCase();
    let classes = "bg-slate-100 text-slate-700";

    if (e === "pendiente") classes = "bg-amber-50 text-amber-700";
    if (e === "aprobado") classes = "bg-emerald-50 text-emerald-700";
    if (e === "rechazado") classes = "bg-rose-50 text-rose-700";
    if (e === "pausado") classes = "bg-slate-200 text-slate-700";

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
        {estado}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              Publicaciones
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Moderación y gestión operativa de terrenos publicados por colaboradores.
            </p>
          </div>

          <button
            onClick={fetchPublicaciones}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">{resumen.total}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-700" />
              <div>
                <p className="text-sm text-slate-500">Pendientes</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{resumen.pendientes}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-sm text-slate-500">Aprobadas</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{resumen.aprobadas}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-rose-700" />
              <div>
                <p className="text-sm text-slate-500">Rechazadas</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{resumen.rechazadas}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ID, título o colaborador..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
              <option value="pausado">Pausados</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {cargando ? (
            <div className="p-6 text-sm text-slate-500">
              Cargando publicaciones...
            </div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No se encontraron publicaciones.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1300px] w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Título</th>
                    <th className="px-4 py-4">Colaborador</th>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-4 py-4">Fecha</th>
                    <th className="px-4 py-4">Ver</th>
                    <th className="px-4 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {publicacionesFiltradas.map((item) => {
                    const loadingEstado = accionCargando === `estado-${item.id}`;
                    const loadingDelete = accionCargando === `delete-${item.id}`;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          #{item.id}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">{item.titulo}</p>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.usuario}
                        </td>

                        <td className="px-4 py-4">{renderEstado(item.estado)}</td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatearFecha(item.creado_en)}
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            href={`/terrenos/${item.id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            Ver terreno
                          </Link>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                abrirModalCambioEstado(item, "aprobado", false)
                              }
                              disabled={loadingEstado}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                            >
                              Aprobar
                            </button>

                            <button
                              onClick={() =>
                                abrirModalCambioEstado(item, "rechazado", true)
                              }
                              disabled={loadingEstado}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            >
                              Rechazar
                            </button>

                            <button
                              onClick={() =>
                                abrirModalCambioEstado(item, "pausado", false)
                              }
                              disabled={loadingEstado}
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                            >
                              <PauseCircle className="h-4 w-4" />
                              Pausar
                            </button>

                            <button
                              onClick={() => eliminarPublicacion(item.id)}
                              disabled={loadingDelete}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              Borrados
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <CambiarEstadoPublicacionModal
        open={modalOpen}
        onClose={() => {
          if (!accionCargando) {
            setModalOpen(false);
            setPublicacionSeleccionada(null);
            setEstadoDestino("");
            setRequiereMensaje(false);
          }
        }}
        onConfirm={confirmarCambioEstado}
        titulo={publicacionSeleccionada?.titulo || ""}
        estadoDestino={estadoDestino}
        requiereMensaje={requiereMensaje}
        loading={!!accionCargando}
      />
    </>
  );
}