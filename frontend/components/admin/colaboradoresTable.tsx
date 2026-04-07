"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";
import {
  Search,
  RefreshCw,
  Users,
  Shield,
  Clock3,
  LandPlot,
  Eye,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import ColaboradorDetailModal from "./colaboradorDetailModal";

interface TerrenoItem {
  id: number;
  titulo: string;
  estado: string;
}

interface Colaborador {
  id: number;
  nombre: string;
  apellido?: string | null;
  email: string;
  foto_perfil?: string | null;
  rol: string;
  auto_aprobado: boolean;
  puede_publicar: boolean;
  bloqueado_publicacion: boolean;
  colaborador_desde?: string | null;
  suscripcion_actual_id?: number | null;
  suscripcion_estado?: string | null;
  suscripcion_origen?: string | null;
  suscripcion_fecha_inicio?: string | null;
  suscripcion_fecha_fin?: string | null;
  limite_terrenos_override?: number | null;
  plan_codigo?: string | null;
  plan_nombre?: string | null;
  plan_limite_terrenos?: number | null;
  publicaciones_totales: number;
  publicaciones_pendientes: number;
  terrenos: TerrenoItem[];
}

type FiltroEstado = "todos" | "activos" | "bloqueados" | "sin_suscripcion";

export default function ColaboradoresTable() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [accionCargando, setAccionCargando] = useState<string | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [colaboradorSeleccionado, setColaboradorSeleccionado] =
    useState<Colaborador | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchColaboradores = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await apiFetch("/api/admin/colaboradores");
      setColaboradores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando colaboradores", error);
      setError("No fue posible cargar los colaboradores.");
      setColaboradores([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const toggleAutoAprobado = async (id: number, currentValue: boolean) => {
    try {
      setAccionCargando(`auto-${id}`);

      await apiFetch(`/api/admin/usuarios/${id}/auto-aprobado`, {
        method: "PUT",
        body: JSON.stringify({
          auto_aprobado: !currentValue,
        }),
      });

      setColaboradores((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, auto_aprobado: !currentValue } : c
        )
      );
    } catch (error) {
      console.error("Error actualizando auto-aprobado", error);
      setError("No fue posible actualizar auto-aprobado.");
    } finally {
      setAccionCargando(null);
    }
  };

  const actualizarLimite = async (col: Colaborador) => {
    const modo = window.prompt(
      "Escribe un número para el nuevo límite o escribe 'ilimitado'.",
      col.limite_terrenos_override === null || col.limite_terrenos_override === undefined
        ? String(col.plan_limite_terrenos ?? "")
        : String(col.limite_terrenos_override)
    );

    if (modo === null) return;

    const valor = modo.trim().toLowerCase();

    try {
      setAccionCargando(`limite-${col.id}`);

      if (valor === "ilimitado") {
        await apiFetch(`/api/admin/colaboradores/${col.id}/limite`, {
          method: "PUT",
          body: JSON.stringify({
            ilimitado: true,
          }),
        });
      } else {
        const numero = Number(valor);

        if (Number.isNaN(numero) || numero < 0) {
          window.alert("Debes ingresar un número válido o escribir 'ilimitado'.");
          return;
        }

        await apiFetch(`/api/admin/colaboradores/${col.id}/limite`, {
          method: "PUT",
          body: JSON.stringify({
            limite_terrenos_override: numero,
            ilimitado: false,
          }),
        });
      }

      await fetchColaboradores();
    } catch (error) {
      console.error("Error actualizando límite del colaborador", error);
      setError("No fue posible actualizar el límite del colaborador.");
    } finally {
      setAccionCargando(null);
    }
  };

  const colaboradoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return colaboradores.filter((col) => {
      const nombreCompleto =
        `${col.nombre || ""} ${col.apellido || ""}`.toLowerCase();
      const email = (col.email || "").toLowerCase();
      const plan = (col.plan_nombre || "").toLowerCase();
      const idTexto = String(col.id);

      const coincideBusqueda =
        !q ||
        nombreCompleto.includes(q) ||
        email.includes(q) ||
        plan.includes(q) ||
        idTexto.includes(q);

      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : filtroEstado === "activos"
          ? col.puede_publicar && !col.bloqueado_publicacion
          : filtroEstado === "bloqueados"
          ? col.bloqueado_publicacion || !col.puede_publicar
          : !col.suscripcion_actual_id;

      return coincideBusqueda && coincideEstado;
    });
  }, [colaboradores, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    return {
      total: colaboradores.length,
      activos: colaboradores.filter(
        (c) => c.puede_publicar && !c.bloqueado_publicacion
      ).length,
      pendientes: colaboradores.filter((c) => c.publicaciones_pendientes > 0)
        .length,
      publicaciones: colaboradores.reduce(
        (acc, c) => acc + (c.publicaciones_totales || 0),
        0
      ),
    };
  }, [colaboradores]);

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderEstadoSuscripcion = (estado?: string | null) => {
    const e = (estado || "").toLowerCase();

    let classes = "bg-slate-100 text-slate-700";
    if (e === "activa" || e === "trialing") {
      classes = "bg-emerald-50 text-emerald-700";
    } else if (e === "pago_pendiente") {
      classes = "bg-amber-50 text-amber-700";
    } else if (e === "vencida" || e === "cancelada" || e === "suspendida") {
      classes = "bg-rose-50 text-rose-700";
    }

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
        {estado || "Sin suscripción"}
      </span>
    );
  };

  const renderPublicacionEstado = (col: Colaborador) => {
    if (col.bloqueado_publicacion) {
      return (
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          Bloqueado
        </span>
      );
    }

    if (col.puede_publicar) {
      return (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Habilitado
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        Inactivo
      </span>
    );
  };

  const abrirDetalle = (colaborador: Colaborador) => {
    setColaboradorSeleccionado(colaborador);
    setDetalleOpen(true);
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
              Colaboradores
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Gestión avanzada de colaboradores, suscripciones, autoaprobación y actividad de publicación.
            </p>
          </div>

          <button
            onClick={fetchColaboradores}
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Colaboradores</p>
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {resumen.total}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Habilitados</p>
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {resumen.activos}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Con pendientes</p>
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {resumen.pendientes}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Publicaciones totales</p>
                <p className="mt-3 text-3xl font-bold text-slate-800">
                  {resumen.publicaciones}
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
                <LandPlot className="h-5 w-5" />
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
                placeholder="Buscar por ID, nombre, email o plan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            >
              <option value="todos">Todos</option>
              <option value="activos">Habilitados</option>
              <option value="bloqueados">Bloqueados / inactivos</option>
              <option value="sin_suscripcion">Sin suscripción</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {cargando ? (
            <div className="p-6 text-sm text-slate-500">
              Cargando colaboradores...
            </div>
          ) : colaboradoresFiltrados.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No se encontraron colaboradores.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1600px] w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Colaborador</th>
                    <th className="px-4 py-4">Suscripción</th>
                    <th className="px-4 py-4">Plan</th>
                    <th className="px-4 py-4">Publicación</th>
                    <th className="px-4 py-4">Desde</th>
                    <th className="px-4 py-4">Terrenos</th>
                    <th className="px-4 py-4">Pendientes</th>
                    <th className="px-4 py-4">Autoaprobado</th>
                    <th className="px-4 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {colaboradoresFiltrados.map((col) => {
                    const nombreCompleto =
                      `${col.nombre || ""} ${col.apellido || ""}`.trim();

                    const cargandoAuto =
                      accionCargando === `auto-${col.id}`;
                    const cargandoLimite =
                      accionCargando === `limite-${col.id}`;

                    const limiteFinal =
                      col.limite_terrenos_override !== null &&
                      col.limite_terrenos_override !== undefined
                        ? col.limite_terrenos_override
                        : col.plan_limite_terrenos;

                    const fotoUrl = col.foto_perfil
                      ? `${apiBase}${col.foto_perfil}`
                      : null;

                    return (
                      <tr
                        key={col.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          #{col.id}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                              {fotoUrl ? (
                                <img
                                  src={fotoUrl}
                                  alt={nombreCompleto}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                                  {(col.nombre?.[0] || "C").toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-slate-800">
                                {nombreCompleto || "Sin nombre"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {col.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {renderEstadoSuscripcion(col.suscripcion_estado)}
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {col.plan_nombre || "Sin plan"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Vence: {formatearFecha(col.suscripcion_fecha_fin)}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {renderPublicacionEstado(col)}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatearFecha(col.colaborador_desde)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-sm text-slate-700">
                              {col.publicaciones_totales} /{" "}
                              {limiteFinal === null || limiteFinal === undefined
                                ? "Ilimitado"
                                : limiteFinal}
                            </span>

                            <button
                              onClick={() => actualizarLimite(col)}
                              disabled={cargandoLimite}
                              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {cargandoLimite ? "Guardando..." : "Modificar límite"}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {col.publicaciones_pendientes > 0 ? (
                            <Link
                              href="/admin/publicaciones/pendientes"
                              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                            >
                              {col.publicaciones_pendientes}
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500">0</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() =>
                              toggleAutoAprobado(col.id, col.auto_aprobado)
                            }
                            disabled={cargandoAuto}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              col.auto_aprobado ? "bg-green-500" : "bg-slate-300"
                            } ${cargandoAuto ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                col.auto_aprobado ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => abrirDetalle(col)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            Ver perfil
                          </button>
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

      <ColaboradorDetailModal
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        colaborador={colaboradorSeleccionado}
      />
    </>
  );
}