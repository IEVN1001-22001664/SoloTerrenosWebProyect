"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Square,
  Pencil,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Info,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Imagen {
  id: number;
  url: string;
}

interface TerrenoPrivado {
  id: number;
  titulo: string;
  descripcion?: string;
  precio?: number;
  ubicacion?: string;
  municipio?: string;
  estado_region?: string;
  direccion?: string;
  estado: string;
  area_m2?: number;
  creado_en?: string;
  actualizado_en?: string;
  imagenes?: Imagen[];
  imagen_principal?: string | null;
  ultima_revision_estado?: string | null;
  ultima_revision_mensaje?: string | null;
  ultima_revision_fecha?: string | null;
}

export default function ColaboradorTerrenoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [terreno, setTerreno] = useState<TerrenoPrivado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState<"pausar" | "reactivar" | null>(null);

  useEffect(() => {
    const fetchTerreno = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`${API_URL}/api/terrenos/privado/${id}`, {
          credentials: "include",
        });

        const raw = await res.text();
        let data: any = null;

        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          data = null;
        }

        if (!res.ok) {
          setError(data?.message || "No fue posible cargar el terreno.");
          return;
        }

        setTerreno(data);
      } catch (err) {
        console.error("Error cargando terreno privado:", err);
        setError("Ocurrió un error cargando el terreno.");
      } finally {
        setCargando(false);
      }
    };

    if (id) fetchTerreno();
  }, [id]);

  const imagenPrincipal = useMemo(() => {
    if (terreno?.imagenes?.length) {
      return `${API_URL}${terreno.imagenes[0].url}`;
    }

    if (terreno?.imagen_principal) {
      return `${API_URL}${terreno.imagen_principal}`;
    }

    return "";
  }, [terreno]);

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPrecio = (precio?: number) => {
    if (precio === null || precio === undefined) return "No definido";
    return `$${Number(precio).toLocaleString("es-MX")}`;
  };

  const getEstadoBadge = (estado?: string) => {
    const e = (estado || "").toLowerCase();

    if (e === "aprobado") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (e === "pendiente") {
      return "bg-amber-100 text-amber-700";
    }

    if (e === "pausado") {
      return "bg-slate-200 text-slate-700";
    }

    if (e === "rechazado") {
      return "bg-rose-100 text-rose-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const cambiarEstado = async (nuevoEstado: "pausado" | "aprobado") => {
    if (!terreno) return;

    try {
      setProcesando(nuevoEstado === "pausado" ? "pausar" : "reactivar");

      const endpoint =
        nuevoEstado === "pausado"
          ? `/api/terrenos/${terreno.id}/pausar`
          : `/api/terrenos/${terreno.id}/reactivar`;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        credentials: "include",
      });

      const raw = await res.text();
      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        alert(data?.message || "No fue posible actualizar el estado.");
        return;
      }

      setTerreno((prev) =>
        prev
          ? {
              ...prev,
              estado: nuevoEstado === "pausado" ? "pausado" : "aprobado",
            }
          : prev
      );
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Ocurrió un error actualizando el estado.");
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando terreno...
          </div>
        </div>
      </main>
    );
  }

  if (error || !terreno) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-red-200 bg-white p-10 shadow-sm">
            <h1 className="text-2xl font-bold text-[#22341c]">
              Terreno no disponible
            </h1>
            <p className="mt-2 text-sm text-red-600">
              {error || "No se pudo cargar este terreno."}
            </p>

            <button
              onClick={() => router.push("/colaborador/misTerrenos")}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
            >
              <ArrowLeft size={16} />
              Volver a mis terrenos
            </button>
          </div>
        </div>
      </main>
    );
  }

  const estaPausado = terreno.estado === "pausado";
  const estaAprobado = terreno.estado === "aprobado";

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/colaborador/misTerrenos")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#817d58] transition hover:text-[#22341c]"
            >
              <ArrowLeft size={16} />
              Volver a mis terrenos
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
                {terreno.titulo}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                  terreno.estado
                )}`}
              >
                {terreno.estado}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#817d58]">
              Vista privada de tu publicación. Aquí puedes revisar su estado aunque no esté visible públicamente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/colaborador/misTerrenos/${terreno.id}/editar`}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
            >
              <Pencil size={16} />
              Editar
            </Link>

            {estaAprobado ? (
              <button
                onClick={() => cambiarEstado("pausado")}
                disabled={procesando !== null}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#817d58]/18 bg-white px-5 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f1eee7] disabled:opacity-60"
              >
                <PauseCircle size={16} />
                {procesando === "pausar" ? "Pausando..." : "Pausar"}
              </button>
            ) : null}

            {estaPausado ? (
              <button
                onClick={() => cambiarEstado("aprobado")}
                disabled={procesando !== null}
                className="inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-60"
              >
                <PlayCircle size={16} />
                {procesando === "reactivar" ? "Reactivando..." : "Reactivar"}
              </button>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] border border-[#817d58]/12 bg-white shadow-sm">
            <div className="relative h-[380px] bg-[#ebe7dd]">
              {imagenPrincipal ? (
                <img
                  src={imagenPrincipal}
                  alt={terreno.titulo}
                  className={`h-full w-full object-cover ${
                    estaPausado ? "grayscale" : ""
                  }`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#817d58]">
                  Sin imagen principal
                </div>
              )}

              {estaPausado && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="rounded-full border border-white/40 bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-[#22341c] shadow-sm backdrop-blur-sm">
                    PUBLICACIÓN PAUSADA
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#22341c]">Resumen</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-[#817d58]">Precio</p>
                <p className="mt-1 text-3xl font-bold text-[#22341c]">
                  {formatPrecio(terreno.precio)}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-[#817d58]" size={18} />
                <div>
                  <p className="text-sm text-[#817d58]">Ubicación</p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {[
                      terreno.ubicacion,
                      terreno.municipio,
                      terreno.estado_region,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No disponible"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Square className="mt-0.5 text-[#817d58]" size={18} />
                <div>
                  <p className="text-sm text-[#817d58]">Área</p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {terreno.area_m2
                      ? `${Number(terreno.area_m2).toLocaleString("es-MX")} m²`
                      : "No disponible"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 text-[#817d58]" size={18} />
                <div>
                  <p className="text-sm text-[#817d58]">Fecha de publicación</p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {formatFecha(terreno.creado_en)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#22341c]">Descripción</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#4f4a3d]">
            {terreno.descripcion || "Sin descripción"}
          </p>
        </section>

        <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f6f1]">
              <Info size={18} className="text-[#22341c]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#22341c]">
                Estado de publicación
              </h2>
              <p className="text-sm text-[#817d58]">
                Información administrativa de tu terreno.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f7f6f1] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                Estado actual
              </p>
              <div className="mt-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                    terreno.estado
                  )}`}
                >
                  {terreno.estado}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f7f6f1] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                Última revisión
              </p>
              <p className="mt-3 text-sm font-medium text-[#22341c]">
                {formatFecha(terreno.ultima_revision_fecha)}
              </p>
            </div>
          </div>

          {terreno.ultima_revision_estado || terreno.ultima_revision_mensaje ? (
            <div className="mt-4 rounded-2xl border border-[#817d58]/12 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                Veredicto administrativo
              </p>

              {terreno.ultima_revision_estado ? (
                <div className="mt-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                      terreno.ultima_revision_estado
                    )}`}
                  >
                    {terreno.ultima_revision_estado}
                  </span>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl bg-[#f7f6f1] p-4">
                <p className="text-sm leading-6 text-[#4f4a3d]">
                  {terreno.ultima_revision_mensaje ||
                    "No hay observaciones adicionales del administrador."}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}