"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  User,
  Ruler,
  BadgeDollarSign,
  FileCheck,
  Layers3,
} from "lucide-react";

const API_URL = "http://localhost:5000";

interface Imagen {
  id: number;
  url: string;
}

interface Documento {
  id: number;
  nombre: string;
  url: string;
  tipo?: string;
  nombre_archivo?: string;
  tamano_bytes?: number;
  creado_en?: string;
}

interface TerrenoPrivado {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion?: string;
  municipio?: string;
  estado_region?: string;
  colonia?: string;
  direccion?: string;
  codigo_postal?: string;
  estado: string;
  area_m2?: number;
  perimetro_m?: number;
  tipo?: string;
  uso_suelo?: string;
  topografia?: string;
  forma?: string;
  tipo_propiedad?: string;
  negociable?: boolean;
  escritura?: boolean | string;
  estatus_legal?: string;
  gravamen?: boolean | string;
  propietario_nombre?: string;
  propietario_apellido?: string;
  propietario_email?: string;
  imagenes: Imagen[];
  documentos?: Documento[];
}

function formatearMoneda(valor?: number) {
  return `$${Number(valor || 0).toLocaleString("es-MX")}`;
}

function formatearBoolean(valor?: boolean | string) {
  if (valor === true || valor === "true" || valor === "sí" || valor === "si") {
    return "Sí";
  }

  if (valor === false || valor === "false" || valor === "no") {
    return "No";
  }

  return valor || "No disponible";
}

function BadgeEstado({ estado }: { estado: string }) {
  const estilos: Record<string, string> = {
    aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    rechazado: "bg-red-50 text-red-700 border-red-200",
    pausado: "bg-orange-50 text-orange-700 border-orange-200",
    eliminado: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        estilos[estado] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {estado || "Sin estado"}
    </span>
  );
}

function ItemDato({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "No disponible"}
      </p>
    </div>
  );
}

export default function AdminPublicacionDetallePage() {
  const params = useParams();
  const id = params?.id as string;

  const [terreno, setTerreno] = useState<TerrenoPrivado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    const fetchTerreno = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`${API_URL}/api/terrenos/privado/${id}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "No fue posible cargar el terreno.");
          return;
        }

        setTerreno({
          ...data,
          imagenes: data?.imagenes || [],
          documentos: data?.documentos || [],
        });
      } catch (err) {
        console.error(err);
        setError("Error cargando el terreno.");
      } finally {
        setCargando(false);
      }
    };

    if (id) fetchTerreno();
  }, [id]);

  const imagenPrincipal = useMemo(() => {
    if (!terreno?.imagenes?.length) return "";
    const imagen = terreno.imagenes[imagenActiva] || terreno.imagenes[0];
    return `${API_URL}${imagen.url}`;
  }, [terreno, imagenActiva]);

  if (cargando) {
    return <div className="p-6">Cargando terreno...</div>;
  }

  if (error || !terreno) {
    return (
      <div className="p-6 text-red-600">
        {error || "Terreno no encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Administración / Publicaciones / Revisión
        </p>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800">{terreno.titulo}</h1>
            <p className="mt-2 text-sm text-slate-500">
              ID publicación: #{terreno.id}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BadgeEstado estado={terreno.estado} />
          </div>
        </div>
      </div>

      {/* Resumen principal */}
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Galería */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Evidencia visual
            </h2>
          </div>

          {imagenPrincipal ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={imagenPrincipal}
                  alt={terreno.titulo}
                  className="h-[320px] w-full object-cover"
                />
              </div>

              {terreno.imagenes.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-5">
                  {terreno.imagenes.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setImagenActiva(index)}
                      className={`overflow-hidden rounded-xl border transition ${
                        imagenActiva === index
                          ? "border-[#22341c] ring-2 ring-[#22341c]/15"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={`${API_URL}${img.url}`}
                        alt={`Imagen ${index + 1}`}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              No hay imágenes cargadas
            </div>
          )}
        </div>

        {/* Resumen técnico */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">
            Resumen técnico
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ItemDato label="Precio" value={formatearMoneda(terreno.precio)} />
            <ItemDato
              label="Área"
              value={
                terreno.area_m2
                  ? `${Number(terreno.area_m2).toLocaleString("es-MX")} m²`
                  : "No disponible"
              }
            />
            <ItemDato
              label="Perímetro"
              value={
                terreno.perimetro_m
                  ? `${Number(terreno.perimetro_m).toLocaleString("es-MX")} m`
                  : "No disponible"
              }
            />
            <ItemDato label="Tipo" value={terreno.tipo} />
            <ItemDato label="Uso de suelo" value={terreno.uso_suelo} />
            <ItemDato label="Topografía" value={terreno.topografia} />
            <ItemDato label="Forma" value={terreno.forma} />
            <ItemDato label="Tipo de propiedad" value={terreno.tipo_propiedad} />
            <ItemDato
              label="Negociable"
              value={formatearBoolean(terreno.negociable)}
            />
            <ItemDato
              label="Escritura"
              value={formatearBoolean(terreno.escritura)}
            />
            <ItemDato label="Estatus legal" value={terreno.estatus_legal} />
            <ItemDato
              label="Gravamen"
              value={formatearBoolean(terreno.gravamen)}
            />
          </div>
        </div>
      </div>

      {/* Ubicación + colaborador */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-slate-600" />
            <h2 className="text-base font-semibold text-slate-800">Ubicación</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ItemDato label="Ubicación general" value={terreno.ubicacion} />
            <ItemDato label="Municipio" value={terreno.municipio} />
            <ItemDato label="Estado / Región" value={terreno.estado_region} />
            <ItemDato label="Colonia" value={terreno.colonia} />
            <ItemDato label="Dirección" value={terreno.direccion} />
            <ItemDato label="Código postal" value={terreno.codigo_postal} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <User size={18} className="text-slate-600" />
            <h2 className="text-base font-semibold text-slate-800">
              Colaborador responsable
            </h2>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Nombre
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {`${terreno.propietario_nombre || ""} ${terreno.propietario_apellido || ""}`.trim() ||
                  "No disponible"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Correo
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {terreno.propietario_email || "No disponible"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Layers3 size={18} className="text-slate-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Descripción y observaciones del anuncio
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
            {terreno.descripcion || "Sin descripción"}
          </p>
        </div>
      </div>

      {/* Documentos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={18} className="text-slate-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Documentos adjuntos
          </h2>
        </div>

        {terreno.documentos && terreno.documentos.length > 0 ? (
          <div className="grid gap-3">
            {terreno.documentos.map((doc) => {
              const urlDocumento = `${API_URL}${doc.url}`;
              const esPDF =
                doc.tipo?.includes("pdf") ||
                doc.nombre?.toLowerCase().endsWith(".pdf");

              const esImagen =
                doc.tipo?.startsWith("image/") ||
                /\.(jpg|jpeg|png|webp)$/i.test(doc.nombre || "");

              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {doc.nombre || `Documento #${doc.id}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tipo: {doc.tipo || "No especificado"}
                      </p>
                    </div>

                    <a
                      href={urlDocumento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Abrir documento
                    </a>
                  </div>

                  {esPDF && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <iframe
                        src={urlDocumento}
                        className="h-[420px] w-full"
                        title={doc.nombre}
                      />
                    </div>
                  )}

                  {esImagen && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={urlDocumento}
                        alt={doc.nombre}
                        className="max-h-[420px] w-full object-contain"
                      />
                    </div>
                  )}

                  {!esPDF && !esImagen && (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                      Vista previa no disponible para este tipo de archivo.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No hay documentos adjuntos para esta publicación.
          </div>
        )}
      </div>
    </div>
  );
}