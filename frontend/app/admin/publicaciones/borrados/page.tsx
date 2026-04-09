"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import {
  AlertTriangle,
  CheckSquare,
  RotateCcw,
  Search,
  Trash2,
  RefreshCw,
  Mail,
  User,
  MapPin,
  CalendarDays,
  Square,
  Filter,
  X,
  CheckCircle2,
  Trash,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface TerrenoBorrado {
  id: number;
  titulo: string;
  precio?: number | null;
  estado: string;
  creado_en?: string;
  actualizado_en?: string;
  usuario?: string;
  usuario_email?: string;
  municipio?: string | null;
  estado_region?: string | null;
  imagen_principal?: string | null;
}

type TipoAccion =
  | "restore-one"
  | "restore-selected"
  | "delete-one"
  | "delete-selected"
  | "empty-trash"
  | null;

type Orden = "recientes" | "antiguos" | "titulo-asc" | "titulo-desc";

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmVariant = "danger",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?: "danger" | "success";
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-2xl p-3 ${
              confirmVariant === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {confirmVariant === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
              confirmVariant === "success"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[95] w-full max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${
          type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <div className="mt-0.5">
          {type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 transition hover:bg-black/5"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function BorradosPage() {
  const [terrenos, setTerrenos] = useState<TerrenoBorrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [accion, setAccion] = useState<TipoAccion>(null);
  const [terrenoActivo, setTerrenoActivo] = useState<TerrenoBorrado | null>(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchBorrados = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/admin/publicaciones/borrados");

      if (Array.isArray(data)) {
        setTerrenos(data);
      } else if (Array.isArray(data.publicaciones)) {
        setTerrenos(data.publicaciones);
      } else {
        setTerrenos([]);
      }
    } catch (error) {
      console.error("Error cargando borrados:", error);
      setError("No fue posible cargar la papelera.");
      setTerrenos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrados();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const abrirModal = (tipo: TipoAccion, terreno?: TerrenoBorrado) => {
    setAccion(tipo);
    setTerrenoActivo(terreno || null);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (accionLoading) return;
    setModalOpen(false);
    setAccion(null);
    setTerrenoActivo(null);
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    if (filtrados.length === 0) return;

    const idsFiltrados = filtrados.map((item) => item.id);
    const todosSeleccionados = idsFiltrados.every((id) => seleccionados.includes(id));

    if (todosSeleccionados) {
      setSeleccionados((prev) => prev.filter((id) => !idsFiltrados.includes(id)));
    } else {
      setSeleccionados((prev) => Array.from(new Set([...prev, ...idsFiltrados])));
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearMoneda = (valor?: number | null) => {
    if (valor === null || valor === undefined) return "No disponible";
    return `$${Number(valor).toLocaleString("es-MX")}`;
  };

  const getImagenUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    const base = terrenos.filter((item) => {
      const texto = [
        item.id,
        item.titulo,
        item.usuario,
        item.usuario_email,
        item.municipio,
        item.estado_region,
        item.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || texto.includes(q);
    });

    return [...base].sort((a, b) => {
      if (orden === "recientes") {
        return new Date(b.creado_en || "").getTime() - new Date(a.creado_en || "").getTime();
      }

      if (orden === "antiguos") {
        return new Date(a.creado_en || "").getTime() - new Date(b.creado_en || "").getTime();
      }

      if (orden === "titulo-asc") {
        return (a.titulo || "").localeCompare(b.titulo || "");
      }

      if (orden === "titulo-desc") {
        return (b.titulo || "").localeCompare(a.titulo || "");
      }

      return 0;
    });
  }, [terrenos, busqueda, orden]);

  const totalSeleccionadosVisibles = filtrados.filter((item) =>
    seleccionados.includes(item.id)
  ).length;

  const resumen = useMemo(() => {
    return {
      total: terrenos.length,
      seleccionados: seleccionados.length,
      visibles: filtrados.length,
    };
  }, [terrenos.length, seleccionados.length, filtrados.length]);

  const ejecutarAccion = async () => {
    try {
      setAccionLoading(true);

      if (accion === "restore-one" && terrenoActivo) {
        await apiFetch(`/api/admin/publicaciones/${terrenoActivo.id}/restaurar`, {
          method: "PUT",
        });
        setToast({
          type: "success",
          message: `La publicación "${terrenoActivo.titulo}" fue restaurada.`,
        });
      }

      if (accion === "restore-selected") {
        for (const id of seleccionados) {
          await apiFetch(`/api/admin/publicaciones/${id}/restaurar`, {
            method: "PUT",
          });
        }

        setToast({
          type: "success",
          message: `Se restauraron ${seleccionados.length} publicaciones seleccionadas.`,
        });
      }

      if (accion === "delete-one" && terrenoActivo) {
        await apiFetch(`/api/admin/publicaciones/${terrenoActivo.id}/definitivo`, {
          method: "DELETE",
        });
        setToast({
          type: "success",
          message: `La publicación "${terrenoActivo.titulo}" fue eliminada definitivamente.`,
        });
      }

      if (accion === "delete-selected") {
        await apiFetch("/api/admin/publicaciones/borrados/seleccionados", {
          method: "DELETE",
          body: JSON.stringify({ ids: seleccionados }),
        });

        setToast({
          type: "success",
          message: `Se eliminaron definitivamente ${seleccionados.length} publicaciones.`,
        });
      }

      if (accion === "empty-trash") {
        await apiFetch("/api/admin/publicaciones/borrados/vaciar", {
          method: "DELETE",
        });

        setToast({
          type: "success",
          message: "La papelera fue vaciada correctamente.",
        });
      }

      setSeleccionados([]);
      setModalOpen(false);
      setAccion(null);
      setTerrenoActivo(null);

      await fetchBorrados();
    } catch (error) {
      console.error("Error ejecutando acción:", error);
      setError("No fue posible completar la acción solicitada.");
      setToast({
        type: "error",
        message: "No fue posible completar la acción solicitada.",
      });
    } finally {
      setAccionLoading(false);
    }
  };

  const textoModal = useMemo(() => {
    if (accion === "restore-one" && terrenoActivo) {
      return {
        title: "Restaurar publicación",
        description: `La publicación "${terrenoActivo.titulo}" saldrá de la papelera y volverá a estar disponible en el sistema.`,
        confirmText: "Restaurar",
        variant: "success" as const,
      };
    }

    if (accion === "restore-selected") {
      return {
        title: "Restaurar seleccionados",
        description: `Se restaurarán ${seleccionados.length} publicaciones seleccionadas y saldrán de la papelera.`,
        confirmText: `Restaurar ${seleccionados.length} seleccionados`,
        variant: "success" as const,
      };
    }

    if (accion === "delete-one" && terrenoActivo) {
      return {
        title: "Eliminar definitivamente",
        description: `La publicación "${terrenoActivo.titulo}" se eliminará de forma permanente. Esta acción no es reversible.`,
        confirmText: "Eliminar definitivamente",
        variant: "danger" as const,
      };
    }

    if (accion === "delete-selected") {
      return {
        title: "Eliminar seleccionados",
        description: `Se eliminarán permanentemente ${seleccionados.length} publicaciones seleccionadas. Esta acción no es reversible.`,
        confirmText: `Eliminar ${seleccionados.length} seleccionados`,
        variant: "danger" as const,
      };
    }

    if (accion === "empty-trash") {
      return {
        title: "Vaciar papelera",
        description:
          "Se eliminarán permanentemente todas las publicaciones de la papelera. Esta acción no es reversible.",
        confirmText: "Vaciar papelera",
        variant: "danger" as const,
      };
    }

    return {
      title: "",
      description: "",
      confirmText: "Confirmar",
      variant: "danger" as const,
    };
  }, [accion, terrenoActivo, seleccionados.length]);

  const todosLosVisiblesSeleccionados =
    filtrados.length > 0 && filtrados.every((item) => seleccionados.includes(item.id));

  return (
    <>
      {toast ? (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}

      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">Papelera</h1>
            <p className="mt-2 text-sm text-slate-500">
              Revisión, restauración y eliminación definitiva de publicaciones borradas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchBorrados}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>

            <button
              onClick={() => abrirModal("empty-trash")}
              disabled={terrenos.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Vaciar papelera
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        <section className="grid gap-5 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total en papelera</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">{resumen.total}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resultados visibles</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">{resumen.visibles}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Seleccionados</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">{resumen.seleccionados}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ID, título, colaborador, correo o ubicación..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="titulo-asc">Título A-Z</option>
                <option value="titulo-desc">Título Z-A</option>
              </select>
            </div>

            <button
              onClick={() => setBusqueda("")}
              disabled={!busqueda}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Limpiar búsqueda
            </button>
          </div>
        </section>

        {seleccionados.length > 0 && (
          <section className="sticky top-4 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <CheckSquare className="h-4 w-4 text-slate-500" />
                <span>
                  {seleccionados.length} seleccionados en total
                  {totalSeleccionadosVisibles !== seleccionados.length
                    ? ` · ${totalSeleccionadosVisibles} visibles en esta vista`
                    : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSeleccionados([])}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Limpiar selección
                </button>

                <button
                  onClick={() => abrirModal("restore-selected")}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurar {seleccionados.length} seleccionados
                </button>

                <button
                  onClick={() => abrirModal("delete-selected")}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash className="h-4 w-4" />
                  Eliminar {seleccionados.length} seleccionados
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Cargando publicaciones borradas...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                No hay publicaciones en papelera
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                No se encontraron resultados con los filtros actuales.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={toggleSeleccionTodos}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {todosLosVisiblesSeleccionados ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {todosLosVisiblesSeleccionados
                    ? "Deseleccionar visibles"
                    : "Seleccionar visibles"}
                </button>

                <p className="text-sm text-slate-500">{filtrados.length} resultados</p>
              </div>

              {filtrados.map((terreno) => {
                const imagenUrl = getImagenUrl(terreno.imagen_principal);
                const checked = seleccionados.includes(terreno.id);

                return (
                  <article
                    key={terreno.id}
                    className={`rounded-3xl border bg-white p-4 shadow-sm transition ${
                      checked
                        ? "border-[#22341c] ring-2 ring-[#22341c]/10"
                        : "border-slate-200 hover:shadow-md"
                    }`}
                  >
                    <div className="grid gap-4 xl:grid-cols-[40px_140px_1fr_240px]">
                      <div className="pt-2">
                        <button
                          onClick={() => toggleSeleccion(terreno.id)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                            checked
                              ? "border-[#22341c] bg-[#22341c] text-white"
                              : "border-slate-300 bg-white text-slate-500"
                          }`}
                          aria-label={`Seleccionar terreno ${terreno.id}`}
                        >
                          {checked ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {imagenUrl ? (
                          <img
                            src={imagenUrl}
                            alt={terreno.titulo}
                            className="h-[110px] w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-[110px] items-center justify-center text-xs text-slate-500">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Publicación #{terreno.id}
                          </p>
                          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            eliminado
                          </span>
                        </div>

                        <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-800">
                          {terreno.titulo}
                        </h2>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Precio
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {formatearMoneda(terreno.precio)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Ubicación
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {[terreno.municipio, terreno.estado_region]
                                .filter(Boolean)
                                .join(", ") || "No disponible"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Colaborador
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {terreno.usuario || "No disponible"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Fecha
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {formatearFecha(terreno.creado_en)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {terreno.usuario || "Sin colaborador"}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {terreno.usuario_email || "Correo no disponible"}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {[terreno.municipio, terreno.estado_region]
                              .filter(Boolean)
                              .join(", ") || "Ubicación no disponible"}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {formatearFecha(terreno.actualizado_en || terreno.creado_en)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Acciones
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Restaurar o eliminar de forma definitiva.
                          </p>
                        </div>

                        <div className="grid gap-3">
                          <button
                            onClick={() => abrirModal("restore-one", terreno)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restaurar
                          </button>

                          <button
                            onClick={() => abrirModal("delete-one", terreno)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar definitivo
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={modalOpen}
        onClose={cerrarModal}
        onConfirm={ejecutarAccion}
        title={textoModal.title}
        description={textoModal.description}
        confirmText={textoModal.confirmText}
        confirmVariant={textoModal.variant}
        loading={accionLoading}
      />
    </>
  );
}