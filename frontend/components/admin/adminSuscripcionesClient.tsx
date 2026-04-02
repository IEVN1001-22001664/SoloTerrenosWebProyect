"use client";

import { useEffect, useMemo, useState } from "react";
import AsignarSuscripcionModal from "./asignarSuscripcionModal";
import {
  CreditCard,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  CalendarClock,
  Search,
  AlertCircle,
} from "lucide-react";

interface SuscripcionAdminItem {
  usuario_id: number;
  nombre: string;
  apellido?: string | null;
  email: string;
  rol: string;
  puede_publicar: boolean;
  bloqueado_publicacion: boolean;
  suscripcion_id?: number | null;
  estado?: string | null;
  origen?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  fecha_proxima_renovacion?: string | null;
  trial_usado?: boolean;
  limite_terrenos_override?: number | null;
  plan_id?: number | null;
  plan_codigo?: string | null;
  plan_nombre?: string | null;
  plan_limite_terrenos?: number | null;
  terrenos_usados: number;
}

export default function AdminSuscripcionesClient() {
  const [items, setItems] = useState<SuscripcionAdminItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [accionCargando, setAccionCargando] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const cargarSuscripciones = async () => {
    try {
      setCargando(true);
      setError("");

      const res = await fetch(`${apiUrl}/api/suscripciones/admin/listado`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No fue posible cargar las suscripciones.");
        setItems([]);
        return;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando suscripciones admin:", err);
      setError("Ocurrió un error cargando las suscripciones.");
      setItems([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const ejecutarAccion = async (
    endpoint: string,
    body: Record<string, any>,
    loadingKey: string
  ) => {
    try {
      setAccionCargando(loadingKey);
      setError("");

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No fue posible completar la acción.");
        return;
      }

      await cargarSuscripciones();
    } catch (err) {
      console.error("Error ejecutando acción admin:", err);
      setError("Ocurrió un error ejecutando la acción.");
    } finally {
      setAccionCargando(null);
    }
  };

  const suspender = async (usuarioId: number) => {
    await ejecutarAccion(
      "/api/suscripciones/admin/suspender",
      {
        usuario_id: usuarioId,
        motivo: "Suspensión manual desde panel admin",
      },
      `suspender-${usuarioId}`
    );
  };

  const reactivar = async (usuarioId: number) => {
    await ejecutarAccion(
      "/api/suscripciones/admin/reactivar",
      {
        usuario_id: usuarioId,
        motivo: "Reactivación manual desde panel admin",
      },
      `reactivar-${usuarioId}`
    );
  };

  const extender = async (usuarioId: number) => {
    const diasTexto = window.prompt("¿Cuántos días deseas extender?", "30");
    if (!diasTexto) return;

    const dias = Number(diasTexto);

    if (Number.isNaN(dias) || dias <= 0) {
      window.alert("Debes ingresar un número válido de días.");
      return;
    }

    await ejecutarAccion(
      "/api/suscripciones/admin/extender",
      {
        usuario_id: usuarioId,
        dias_extra: dias,
        motivo: `Extensión manual de ${dias} días desde panel admin`,
      },
      `extender-${usuarioId}`
    );
  };

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const nombreCompleto = `${item.nombre || ""} ${item.apellido || ""}`.toLowerCase();
      const email = (item.email || "").toLowerCase();
      const plan = (item.plan_nombre || "").toLowerCase();
      const estado = (item.estado || "").toLowerCase();

      return (
        nombreCompleto.includes(q) ||
        email.includes(q) ||
        plan.includes(q) ||
        estado.includes(q)
      );
    });
  }, [items, busqueda]);

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "No disponible";

    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderEstado = (estado?: string | null) => {
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

    return (
    <>
        <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">
                Suscripciones
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Consulta el estado de las membresías y ejecuta acciones manuales sobre cada colaborador.
            </p>
            </div>

            <div className="flex flex-wrap gap-3">
            <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#828d4b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
            >
                + Asignar suscripción
            </button>

            <button
                onClick={cargarSuscripciones}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
                <RefreshCw className="h-4 w-4" />
                Actualizar
            </button>
            </div>
        </div>

        {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <p>{error}</p>
            </div>
            </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, email, plan o estado..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            />
            </div>
        </div>

        {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Cargando suscripciones...
            </div>
        ) : itemsFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No se encontraron resultados.
            </div>
        ) : (
            <div className="grid gap-5">
            {itemsFiltrados.map((item) => {
                const nombreCompleto = `${item.nombre || ""} ${item.apellido || ""}`.trim();

                const limiteFinal =
                item.limite_terrenos_override !== null &&
                item.limite_terrenos_override !== undefined
                    ? item.limite_terrenos_override
                    : item.plan_limite_terrenos;

                const cargandoSuspender = accionCargando === `suspender-${item.usuario_id}`;
                const cargandoReactivar = accionCargando === `reactivar-${item.usuario_id}`;
                const cargandoExtender = accionCargando === `extender-${item.usuario_id}`;

                return (
                <article
                    key={item.usuario_id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                        <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                            {nombreCompleto || "Usuario sin nombre"}
                            </h3>
                            {renderEstado(item.estado)}
                        </div>

                        <p className="mt-2 text-sm text-slate-500">{item.email}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                            Plan
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                            {item.plan_nombre || "Sin plan"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                            Origen
                            </p>
                            <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                            {item.origen || "No disponible"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                            Vigencia hasta
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                            {formatearFecha(item.fecha_fin)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                            Terrenos usados
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                            {item.terrenos_usados} /{" "}
                            {limiteFinal === null || limiteFinal === undefined
                                ? "Ilimitado"
                                : limiteFinal}
                            </p>
                        </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>
                            <strong className="text-slate-700">Rol:</strong> {item.rol}
                        </span>
                        <span>
                            <strong className="text-slate-700">Publicación:</strong>{" "}
                            {item.puede_publicar ? "Habilitada" : "Bloqueada"}
                        </span>
                        <span>
                            <strong className="text-slate-700">Trial usado:</strong>{" "}
                            {item.trial_usado ? "Sí" : "No"}
                        </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-[220px]">
                        <button
                        onClick={() => suspender(item.usuario_id)}
                        disabled={cargandoSuspender}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                        <PauseCircle className="h-4 w-4" />
                        {cargandoSuspender ? "Suspendiendo..." : "Suspender"}
                        </button>

                        <button
                        onClick={() => reactivar(item.usuario_id)}
                        disabled={cargandoReactivar}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                        <PlayCircle className="h-4 w-4" />
                        {cargandoReactivar ? "Reactivando..." : "Reactivar"}
                        </button>

                        <button
                        onClick={() => extender(item.usuario_id)}
                        disabled={cargandoExtender}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                        <CalendarClock className="h-4 w-4" />
                        {cargandoExtender ? "Extendiéndose..." : "Extender"}
                        </button>
                    </div>
                    </div>
                </article>
                );
            })}
            </div>
        )}
        </div>

        <AsignarSuscripcionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={cargarSuscripciones}
        />
    </>
    );
}