"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";
import {
  Search,
  RefreshCw,
  Clock3,
  Check,
  X,
  PauseCircle,
  Trash2,
  Eye,
  AlertCircle,
  MapPin,
  LandPlot,
  BadgeDollarSign,
  User,
  Mail,
  FileText,
  Image as ImageIcon,
  Layers3,
  CalendarDays,
} from "lucide-react";
import CambiarEstadoPublicacionModal from "@/components/admin/publicaciones/cambiarEstadoPublicacionModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Publicacion {
  id: number;
  titulo: string;
  descripcion?: string;
  estado: string;
  creado_en: string;
  actualizado_en?: string;
  precio?: number | null;
  ubicacion?: string | null;
  municipio?: string | null;
  estado_region?: string | null;
  area_m2?: number | null;
  tipo?: string | null;
  uso_suelo?: string | null;
  usuario: string;
  usuario_email?: string | null;
  imagen_principal?: string | null;
  total_imagenes?: number;
  total_documentos?: number;
  tiene_imagenes?: boolean;
  tiene_documentos?: boolean;
  lista_para_revision?: boolean;
}

export default function PendientesTable() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
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
      console.error("Error cargando publicaciones pendientes:", error);
      setError("No fue posible cargar las publicaciones pendientes.");
      setPublicaciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const publicacionesPendientes = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return publicaciones
      .filter((item) => item.estado?.toLowerCase() === "pendiente")
      .filter((item) => {
        const texto = [
          item.id,
          item.titulo,
          item.usuario,
          item.usuario_email,
          item.municipio,
          item.estado_region,
          item.ubicacion,
          item.tipo,
          item.uso_suelo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !q || texto.includes(q);
      });
  }, [publicaciones, busqueda]);

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

      await apiFetch(
        `/api/admin/publicaciones/${publicacionSeleccionada.id}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({
            estado: estadoDestino,
            mensaje: mensaje || undefined,
          }),
        }
      );

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
    const confirmado = window.confirm("¿Enviar esta publicación a borrados?");
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

  const formatearArea = (valor?: number | null) => {
    if (valor === null || valor === undefined) return "No disponible";
    return `${Number(valor).toLocaleString("es-MX")} m²`;
  };

  const getImagenUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const IconActionButton = ({
    onClick,
    icon,
    title,
    className,
    disabled = false,
  }: {
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    className: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
    </button>
  );

  const Chip = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-600">
              Revisión pendiente
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              Publicaciones pendientes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Vista enfocada únicamente en publicaciones que necesitan aprobación.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPublicaciones}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-700" />
              <div>
                <p className="text-sm text-amber-700">Pendientes</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {publicacionesPendientes.length}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total en sistema</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">
              {publicaciones.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resultados visibles</p>
            <p className="mt-3 text-3xl font-bold text-slate-800">
              {publicacionesPendientes.length}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar pendiente por ID, título, colaborador, correo, ubicación o tipo..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>
        </section>

        <section className="space-y-4">
          {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Cargando publicaciones pendientes...
            </div>
          ) : publicacionesPendientes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No hay publicaciones pendientes por revisar.
            </div>
          ) : (
            publicacionesPendientes.map((item) => {
              const loadingEstado = accionCargando === `estado-${item.id}`;
              const loadingDelete = accionCargando === `delete-${item.id}`;
              const imagenUrl = getImagenUrl(item.imagen_principal);

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="grid gap-4 xl:grid-cols-[280px_1fr_220px]">
                    <div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {imagenUrl ? (
                          <img
                            src={imagenUrl}
                            alt={item.titulo}
                            className="h-[210px] w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-[210px] items-center justify-center text-sm text-slate-500">
                            Sin imagen principal
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Publicación
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            #{item.id}
                          </p>
                        </div>

                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pendiente
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-semibold text-slate-800">
                        {item.titulo}
                      </h2>

                      {item.descripcion && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {item.descripcion}
                        </p>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Chip
                          icon={<MapPin className="h-3.5 w-3.5" />}
                          label="Municipio"
                          value={item.municipio || "No disponible"}
                        />

                        <Chip
                          icon={<MapPin className="h-3.5 w-3.5" />}
                          label="Estado"
                          value={item.estado_region || "No disponible"}
                        />

                        <Chip
                          icon={<BadgeDollarSign className="h-3.5 w-3.5" />}
                          label="Precio"
                          value={formatearMoneda(item.precio)}
                        />

                        <Chip
                          icon={<LandPlot className="h-3.5 w-3.5" />}
                          label="Área"
                          value={formatearArea(item.area_m2)}
                        />

                        <Chip
                          icon={<Layers3 className="h-3.5 w-3.5" />}
                          label="Tipo"
                          value={item.tipo || "No disponible"}
                        />

                        <Chip
                          icon={<Layers3 className="h-3.5 w-3.5" />}
                          label="Uso de suelo"
                          value={item.uso_suelo || "No disponible"}
                        />

                        <Chip
                          icon={<FileText className="h-3.5 w-3.5" />}
                          label="Documentos"
                          value={item.total_documentos ?? 0}
                        />

                        <Chip
                          icon={<ImageIcon className="h-3.5 w-3.5" />}
                          label="Imágenes"
                          value={item.total_imagenes ?? 0}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            <User className="h-3.5 w-3.5" />
                            <span>Colaborador</span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-800">
                            {item.usuario}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-4 w-4" />
                            {item.usuario_email || "Correo no disponible"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Fechas</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-800">
                            Creado:{" "}
                            <span className="font-medium">
                              {formatearFecha(item.creado_en)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm text-slate-800">
                            Actualizado:{" "}
                            <span className="font-medium">
                              {formatearFecha(item.actualizado_en)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                            item.tiene_imagenes
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <ImageIcon className="h-4 w-4" />
                          {item.tiene_imagenes ? "Con imágenes" : "Sin imágenes"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                            item.tiene_documentos
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          {item.tiene_documentos
                            ? "Con documentos"
                            : "Sin documentos"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                            item.lista_para_revision
                              ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.lista_para_revision
                            ? "Lista para revisión"
                            : "Información incompleta"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Acciones rápidas
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Aprobar, rechazar o pausar esta publicación.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <IconActionButton
                          onClick={() =>
                            abrirModalCambioEstado(item, "aprobado", false)
                          }
                          disabled={loadingEstado}
                          title="Aprobar"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          icon={<Check className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() =>
                            abrirModalCambioEstado(item, "rechazado", true)
                          }
                          disabled={loadingEstado}
                          title="Rechazar"
                          className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          icon={<X className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() =>
                            abrirModalCambioEstado(item, "pausado", true)
                          }
                          disabled={loadingEstado}
                          title="Pausar"
                          className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          icon={<PauseCircle className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() => eliminarPublicacion(item.id)}
                          disabled={loadingDelete}
                          title="Enviar a borrados"
                          className="border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                          icon={<Trash2 className="h-5 w-5" />}
                        />

                        <Link
                          href={`/admin/publicaciones/${item.id}`}
                          title="Ver detalle"
                          aria-label="Ver detalle"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
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