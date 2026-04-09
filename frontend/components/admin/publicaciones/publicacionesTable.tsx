"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";
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
  RotateCcw,
  Check,
  X,
  MapPin,
  CalendarDays,
  LandPlot,
  BadgeDollarSign,
  User,
  Mail,
  FileText,
  Image as ImageIcon,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import CambiarEstadoPublicacionModal from "./cambiarEstadoPublicacionModal";

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
  colonia?: string | null;
  direccion?: string | null;
  codigo_postal?: string | null;
  area_m2?: number | null;
  perimetro_m?: number | null;
  tipo?: string | null;
  uso_suelo?: string | null;
  topografia?: string | null;
  forma?: string | null;
  tipo_propiedad?: string | null;
  negociable?: boolean | string | null;
  escritura?: boolean | string | null;
  estatus_legal?: string | null;
  gravamen?: boolean | string | null;
  usuario_id?: number;
  usuario: string;
  usuario_email?: string | null;
  imagen_principal?: string | null;
  total_imagenes?: number;
  total_documentos?: number;
  tiene_imagenes?: boolean;
  tiene_documentos?: boolean;
  lista_para_revision?: boolean;
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

  const [hoverResumenId, setHoverResumenId] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
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

  const publicacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return publicaciones.filter((item) => {
      const texto = [
        item.id,
        item.titulo,
        item.usuario,
        item.usuario_email,
        item.estado,
        item.municipio,
        item.estado_region,
        item.ubicacion,
        item.tipo,
        item.uso_suelo,
        item.estatus_legal,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = !q || texto.includes(q);
      const coincideEstado =
        filtroEstado === "todos" ? true : item.estado?.toLowerCase() === filtroEstado;

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

  const renderEstado = (estado: string) => {
    const e = estado.toLowerCase();
    let classes = "bg-slate-100 text-slate-700 border-slate-200";

    if (e === "pendiente") classes = "bg-amber-50 text-amber-700 border-amber-200";
    if (e === "aprobado") classes = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (e === "rechazado") classes = "bg-rose-50 text-rose-700 border-rose-200";
    if (e === "pausado") classes = "bg-slate-200 text-slate-700 border-slate-300";

    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${classes}`}
      >
        {estado}
      </span>
    );
  };

  const iniciarHoverResumen = (id: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    hoverTimerRef.current = setTimeout(() => {
      setHoverResumenId(id);
    }, 5000);
  };

  const terminarHoverResumen = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoverResumenId(null);
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
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Administración
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              Publicaciones
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Revisión masiva de propuestas con datos clave, evidencia y acciones rápidas.
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
                placeholder="Buscar por ID, título, colaborador, correo, ubicación, tipo..."
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

        <section className="space-y-4">
          {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Cargando publicaciones...
            </div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No se encontraron publicaciones.
            </div>
          ) : (
            publicacionesFiltradas.map((item) => {
              const loadingEstado = accionCargando === `estado-${item.id}`;
              const loadingDelete = accionCargando === `delete-${item.id}`;
              const imagenUrl = getImagenUrl(item.imagen_principal);
              const mostrarResumen = hoverResumenId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="grid gap-4 xl:grid-cols-[300px_1fr_245px]">
                    <div className="relative">
                      <div
                        className="relative overflow-visible"
                        onMouseEnter={() => iniciarHoverResumen(item.id)}
                        onMouseLeave={terminarHoverResumen}
                      >
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

                        {mostrarResumen && (
                          <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Resumen rápido
                            </p>

                            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">
                              {item.titulo}
                            </h3>

                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                              <p className="flex items-center gap-2">
                                <BadgeDollarSign className="h-4 w-4 text-slate-500" />
                                {formatearMoneda(item.precio)}
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                {[item.municipio, item.estado_region].filter(Boolean).join(", ") ||
                                  "Ubicación no disponible"}
                              </p>
                              <p className="flex items-center gap-2">
                                <LandPlot className="h-4 w-4 text-slate-500" />
                                {formatearArea(item.area_m2)}
                              </p>
                              <p className="flex items-center gap-2">
                                <Layers3 className="h-4 w-4 text-slate-500" />
                                {item.tipo || "Tipo no disponible"}
                              </p>
                              <p className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-slate-500" />
                                {item.estatus_legal || "Estatus legal no disponible"}
                              </p>
                              <p className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-500" />
                                {item.usuario}
                              </p>
                            </div>
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

                        <div>{renderEstado(item.estado)}</div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h2 className="line-clamp-2 text-lg font-semibold text-slate-800">
                            {item.titulo}
                          </h2>

                          {item.descripcion ? (
                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                              {item.descripcion}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <Chip
                            icon={<MapPin className="h-3.5 w-3.5" />}
                            label="Municipio"
                            value={item.municipio || "No disponible"}
                          />
                          <Chip
                            icon={<MapPin className="h-3.5 w-3.5" />}
                            label="Estado / Región"
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

                        <div className="grid gap-3 lg:grid-cols-2">
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
                              Creado: <span className="font-medium">{formatearFecha(item.creado_en)}</span>
                            </p>
                            <p className="mt-1 text-sm text-slate-800">
                              Actualizado:{" "}
                              <span className="font-medium">
                                {formatearFecha(item.actualizado_en)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          {/* Tiene imágenes */}
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

                          {/* Tiene documentos */}
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                              item.tiene_documentos
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                            {item.tiene_documentos ? "Con documentos" : "Sin documentos"}
                          </span>

                          {/* 🔥 NUEVO: LISTA PARA REVISIÓN */}
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

                          {/* Botón ver */}
                          <Link
                            href={`/admin/publicaciones/${item.id}`}
                            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalle
                          </Link>

                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Acciones rápidas
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Flujo optimizado para revisión intensiva.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <IconActionButton
                          onClick={() => abrirModalCambioEstado(item, "aprobado", false)}
                          disabled={loadingEstado}
                          title="Aprobar"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          icon={<Check className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() => abrirModalCambioEstado(item, "rechazado", true)}
                          disabled={loadingEstado}
                          title="Rechazar"
                          className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          icon={<X className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() => abrirModalCambioEstado(item, "pausado", true)}
                          disabled={loadingEstado}
                          title="Pausar"
                          className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          icon={<PauseCircle className="h-5 w-5" />}
                        />

                        <IconActionButton
                          onClick={() => abrirModalCambioEstado(item, "aprobado", false)}
                          disabled={loadingEstado || item.estado !== "pausado"}
                          title="Reactivar"
                          className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                          icon={<RotateCcw className="h-5 w-5" />}
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