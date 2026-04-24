"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";
import {
  AlertTriangle,
  BadgeDollarSign,
  Eye,
  LandPlot,
  MapPin,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";

interface Publicacion {
  id: number;
  titulo: string;
  estado: string;
  precio?: number | null;
  area_m2?: number | null;
  municipio?: string | null;
  estado_region?: string | null;
  ubicacion?: string | null;
  uso_suelo?: string | null;
  tipo?: string | null;
  usuario?: string | null;
  usuario_email?: string | null;
}

type RiesgoTipo =
  | "sin_precio"
  | "sin_area"
  | "precio_bajo"
  | "precio_alto"
  | "precio_m2_bajo"
  | "precio_m2_alto";

interface PublicacionValuada extends Publicacion {
  precio_m2: number | null;
  riesgos: {
    tipo: RiesgoTipo;
    titulo: string;
    descripcion: string;
    severidad: "alta" | "media" | "baja";
  }[];
}

export default function ValuacionesClient() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRiesgo, setFiltroRiesgo] = useState("todos");

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/admin/publicaciones");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando valuaciones:", error);
      setError("No fue posible cargar las publicaciones para valuación.");
      setPublicaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const publicacionesValuadas = useMemo<PublicacionValuada[]>(() => {
    return publicaciones
      .filter((item) => item.estado !== "eliminado")
      .map((item) => {
        const precio = Number(item.precio || 0);
        const area = Number(item.area_m2 || 0);
        const precio_m2 = precio > 0 && area > 0 ? precio / area : null;

        const riesgos: PublicacionValuada["riesgos"] = [];

        if (!item.precio || precio <= 0) {
          riesgos.push({
            tipo: "sin_precio",
            titulo: "Sin precio publicado",
            descripcion: "No se puede evaluar el valor comercial sin precio.",
            severidad: "alta",
          });
        }

        if (!item.area_m2 || area <= 0) {
          riesgos.push({
            tipo: "sin_area",
            titulo: "Sin superficie válida",
            descripcion: "No se puede calcular precio por m² sin área.",
            severidad: "alta",
          });
        }

        if (precio > 0 && precio < 100000) {
          riesgos.push({
            tipo: "precio_bajo",
            titulo: "Precio total muy bajo",
            descripcion: "El precio publicado parece inusualmente bajo.",
            severidad: "media",
          });
        }

        if (precio > 50000000) {
          riesgos.push({
            tipo: "precio_alto",
            titulo: "Precio total muy alto",
            descripcion: "Conviene revisar si el precio fue capturado correctamente.",
            severidad: "media",
          });
        }

        if (precio_m2 !== null && precio_m2 < 100) {
          riesgos.push({
            tipo: "precio_m2_bajo",
            titulo: "Precio por m² muy bajo",
            descripcion: "El precio por metro cuadrado parece sospechosamente bajo.",
            severidad: "alta",
          });
        }

        if (precio_m2 !== null && precio_m2 > 25000) {
          riesgos.push({
            tipo: "precio_m2_alto",
            titulo: "Precio por m² muy alto",
            descripcion: "El precio por metro cuadrado parece elevado para una revisión inicial.",
            severidad: "media",
          });
        }

        return {
          ...item,
          precio_m2,
          riesgos,
        };
      });
  }, [publicaciones]);

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return publicacionesValuadas.filter((item) => {
      const matchBusqueda =
        !q ||
        [
          item.id,
          item.titulo,
          item.municipio,
          item.estado_region,
          item.ubicacion,
          item.usuario,
          item.usuario_email,
          item.uso_suelo,
          item.tipo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchRiesgo =
        filtroRiesgo === "todos" ||
        item.riesgos.some((riesgo) => riesgo.tipo === filtroRiesgo);

      return matchBusqueda && matchRiesgo;
    });
  }, [publicacionesValuadas, busqueda, filtroRiesgo]);

  const conRiesgos = publicacionesValuadas.filter(
    (item) => item.riesgos.length > 0
  );

  const formatMoney = (value?: number | null) => {
    if (!value || Number.isNaN(Number(value))) return "No disponible";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const severityClass = (severidad: "alta" | "media" | "baja") => {
    if (severidad === "alta") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (severidad === "media") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  return (
    <main className="space-y-7">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#817d58]">
            Revisión inteligente
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Valuaciones
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Detección automática de publicaciones con precio, superficie o precio
            por m² que requieren revisión administrativa.
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
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Publicaciones revisadas</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {publicacionesValuadas.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Con alertas</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {conRiesgos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm text-red-700">Alertas críticas</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {
              publicacionesValuadas.filter((item) =>
                item.riesgos.some((r) => r.severidad === "alta")
              ).length
            }
          </p>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por terreno, colaborador, ubicación o ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:bg-white"
          />
        </div>

        <select
          value={filtroRiesgo}
          onChange={(e) => setFiltroRiesgo(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-white"
        >
          <option value="todos">Todos los riesgos</option>
          <option value="sin_precio">Sin precio</option>
          <option value="sin_area">Sin superficie</option>
          <option value="precio_bajo">Precio total bajo</option>
          <option value="precio_alto">Precio total alto</option>
          <option value="precio_m2_bajo">Precio/m² bajo</option>
          <option value="precio_m2_alto">Precio/m² alto</option>
        </select>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Analizando publicaciones...
          </div>
        ) : resultados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No hay publicaciones que coincidan con los filtros.
          </div>
        ) : (
          resultados.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      #{item.id}
                    </span>

                    <span className="rounded-full bg-[#edf1e5] px-3 py-1 text-xs font-semibold capitalize text-[#22341c]">
                      {item.estado}
                    </span>

                    {item.riesgos.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {item.riesgos.length} alerta
                        {item.riesgos.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-xl font-semibold text-slate-800">
                    {item.titulo}
                  </h2>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                      icon={<BadgeDollarSign className="h-4 w-4" />}
                      label="Precio"
                      value={formatMoney(item.precio)}
                    />

                    <InfoCard
                      icon={<LandPlot className="h-4 w-4" />}
                      label="Superficie"
                      value={
                        item.area_m2
                          ? `${Number(item.area_m2).toLocaleString("es-MX")} m²`
                          : "No disponible"
                      }
                    />

                    <InfoCard
                      icon={
                        item.precio_m2 && item.precio_m2 > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )
                      }
                      label="Precio por m²"
                      value={
                        item.precio_m2
                          ? formatMoney(item.precio_m2)
                          : "No calculable"
                      }
                    />

                    <InfoCard
                      icon={<MapPin className="h-4 w-4" />}
                      label="Ubicación"
                      value={
                        item.municipio ||
                        item.estado_region ||
                        item.ubicacion ||
                        "No disponible"
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-slate-800">
                        {item.usuario || "Colaborador no disponible"}
                      </span>
                      {item.usuario_email && (
                        <span className="text-slate-500">
                          · {item.usuario_email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Alertas de valuación
                  </p>

                  <div className="mt-3 space-y-2">
                    {item.riesgos.length === 0 ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                        Sin alertas detectadas.
                      </div>
                    ) : (
                      item.riesgos.map((riesgo) => (
                        <div
                          key={`${item.id}-${riesgo.tipo}`}
                          className={`rounded-xl border px-3 py-3 text-sm ${severityClass(
                            riesgo.severidad
                          )}`}
                        >
                          <p className="font-semibold">{riesgo.titulo}</p>
                          <p className="mt-1 text-xs opacity-90">
                            {riesgo.descripcion}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    href={`/admin/publicaciones/${item.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22341c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
                  >
                    <Eye className="h-4 w-4" />
                    Ver publicación
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}