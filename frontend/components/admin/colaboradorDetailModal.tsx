"use client";

import Link from "next/link";
import { X, User, Mail, ShieldCheck, LandPlot, CalendarClock } from "lucide-react";

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
  foto_perfil?: string | null;
  terrenos: TerrenoItem[];
}

export default function ColaboradorDetailModal({
  open,
  onClose,
  colaborador,
}: {
  open: boolean;
  onClose: () => void;
  colaborador: Colaborador | null;
}) {
  if (!open || !colaborador) return null;

  const nombreCompleto =
    `${colaborador.nombre || ""} ${colaborador.apellido || ""}`.trim();

  const limiteFinal =
    colaborador.limite_terrenos_override !== null &&
    colaborador.limite_terrenos_override !== undefined
      ? colaborador.limite_terrenos_override
      : colaborador.plan_limite_terrenos;

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Perfil del colaborador
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Vista resumida de actividad, suscripción y publicaciones.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <User className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">Nombre</p>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {nombreCompleto || "Sin nombre"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">Email</p>
              </div>
              <p className="text-sm font-medium text-slate-800 break-all">
                {colaborador.email}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">Plan</p>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {colaborador.plan_nombre || "Sin plan"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <CalendarClock className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">Colaborador desde</p>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {formatearFecha(colaborador.colaborador_desde)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Estado suscripción
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {colaborador.suscripcion_estado || "Sin suscripción"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Vigencia
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatearFecha(colaborador.suscripcion_fecha_fin)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Publicación
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {colaborador.puede_publicar ? "Habilitada" : "Bloqueada"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Límite de terrenos
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {colaborador.publicaciones_totales} /{" "}
                {limiteFinal === null || limiteFinal === undefined
                  ? "Ilimitado"
                  : limiteFinal}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <LandPlot className="h-4 w-4 text-slate-500" />
              <h3 className="text-base font-semibold text-slate-800">
                Terrenos del colaborador
              </h3>
            </div>

            {colaborador.terrenos?.length ? (
              <div className="space-y-3">
                {colaborador.terrenos.map((terreno) => (
                  <div
                    key={terreno.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{terreno.titulo}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Estado: {terreno.estado}
                      </p>
                    </div>

                    <Link
                      href={`/terrenos/${terreno.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver terreno
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Este colaborador todavía no tiene terrenos registrados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}