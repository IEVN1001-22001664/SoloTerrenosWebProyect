"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Search,
  Star,
  StarOff,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Publicacion {
  id: number;
  titulo: string;
  estado: string;
  precio?: number | null;
  municipio?: string | null;
  estado_region?: string | null;
  ubicacion?: string | null;
  usuario?: string | null;
  usuario_email?: string | null;
  imagen_principal?: string | null;

  destacado?: boolean | null;
  orden_destacado?: number | null;
  destacado_desde?: string | null;
  destacado_hasta?: string | null;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function getImagenUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "Sin precio";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function estadoDestacado(item: Publicacion) {
  if (!item.destacado) return "no_destacado";

  const hoy = new Date();
  const desde = item.destacado_desde ? new Date(item.destacado_desde) : null;
  const hasta = item.destacado_hasta ? new Date(item.destacado_hasta) : null;

  if (desde && desde > hoy) return "programado";
  if (hasta && hasta < hoy) return "vencido";

  return "activo";
}

export default function DestacadosClient() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [error, setError] = useState("");

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/admin/publicaciones");
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando destacados:", error);
      setError("No fue posible cargar las publicaciones destacadas.");
      setPublicaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const actualizarLocal = (
    id: number,
    cambios: Partial<Publicacion>
  ) => {
    setPublicaciones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...cambios } : item))
    );
  };

  const guardarDestacado = async (item: Publicacion) => {
    try {
      setSavingId(item.id);

      await apiFetch(`/api/admin/publicaciones/${item.id}/destacado`, {
        method: "PATCH",
        body: JSON.stringify({
          destacado: Boolean(item.destacado),
          orden_destacado: item.orden_destacado || null,
          destacado_desde: item.destacado_desde || null,
          destacado_hasta: item.destacado_hasta || null,
        }),
      });

      await fetchPublicaciones();
    } catch (error) {
      console.error("Error guardando destacado:", error);
      setError("No fue posible guardar la configuración de destacado.");
    } finally {
      setSavingId(null);
    }
  };

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return publicaciones
      .filter((item) => item.estado !== "eliminado")
      .filter((item) => {
        const estadoActual = estadoDestacado(item);

        if (filtro === "destacados") return item.destacado;
        if (filtro === "activos") return estadoActual === "activo";
        if (filtro === "programados") return estadoActual === "programado";
        if (filtro === "vencidos") return estadoActual === "vencido";
        if (filtro === "no_destacados") return !item.destacado;

        return true;
      })
      .filter((item) => {
        const texto = [
          item.id,
          item.titulo,
          item.estado,
          item.municipio,
          item.estado_region,
          item.ubicacion,
          item.usuario,
          item.usuario_email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !q || texto.includes(q);
      })
      .sort((a, b) => {
        const aDest = a.destacado ? 0 : 1;
        const bDest = b.destacado ? 0 : 1;

        if (aDest !== bDest) return aDest - bDest;

        return Number(a.orden_destacado || 9999) -
          Number(b.orden_destacado || 9999);
      });
  }, [publicaciones, busqueda, filtro]);

  const totalDestacados = publicaciones.filter((item) => item.destacado).length;
  const activos = publicaciones.filter(
    (item) => estadoDestacado(item) === "activo"
  ).length;
  const vencidos = publicaciones.filter(
    (item) => estadoDestacado(item) === "vencido"
  ).length;

  return (
    <main className="space-y-7">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#817d58]">
            Gestión editorial
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Publicaciones destacadas
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Configura qué terrenos aparecen como destacados, su orden y su vigencia.
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
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-700" />
            <div>
              <p className="text-sm text-yellow-700">Destacados</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">
                {totalDestacados}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Activos</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{activos}</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-sm text-rose-700">Vencidos</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{vencidos}</p>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_240px]">
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
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-white"
        >
          <option value="todos">Todos</option>
          <option value="destacados">Destacados</option>
          <option value="activos">Activos</option>
          <option value="programados">Programados</option>
          <option value="vencidos">Vencidos</option>
          <option value="no_destacados">No destacados</option>
        </select>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Cargando publicaciones...
          </div>
        ) : resultados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No hay publicaciones que coincidan con los filtros.
          </div>
        ) : (
          resultados.map((item) => {
            const imagenUrl = getImagenUrl(item.imagen_principal);
            const estadoActual = estadoDestacado(item);
            const guardando = savingId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="grid gap-5 xl:grid-cols-[260px_1fr_360px]">
                  <div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {imagenUrl ? (
                        <img
                          src={imagenUrl}
                          alt={item.titulo}
                          className="h-[190px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[190px] items-center justify-center text-sm text-slate-500">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        #{item.id}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          estadoActual === "activo"
                            ? "bg-emerald-100 text-emerald-700"
                            : estadoActual === "programado"
                            ? "bg-blue-100 text-blue-700"
                            : estadoActual === "vencido"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {estadoActual.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-800">
                      {item.titulo}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.municipio || item.ubicacion || "Ubicación no disponible"}
                      {item.estado_region ? `, ${item.estado_region}` : ""}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoCard
                        icon={<BadgeCheck className="h-4 w-4" />}
                        label="Estado"
                        value={item.estado}
                      />

                      <InfoCard
                        icon={<Star className="h-4 w-4" />}
                        label="Orden"
                        value={item.orden_destacado ?? "Sin orden"}
                      />

                      <InfoCard
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Desde"
                        value={toDateInputValue(item.destacado_desde) || "No definido"}
                      />

                      <InfoCard
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Hasta"
                        value={toDateInputValue(item.destacado_hasta) || "No definido"}
                      />
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">
                        {formatMoney(item.precio)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Colaborador: {item.usuario || "No disponible"}
                      </p>
                    </div>

                    <Link
                      href={`/admin/publicaciones/${item.id}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#22341c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Configuración de destacado
                    </p>

                    <div className="mt-4 space-y-4">
                      <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          {item.destacado ? (
                            <Star className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <StarOff className="h-4 w-4 text-slate-400" />
                          )}
                          Destacado
                        </span>

                        <input
                          type="checkbox"
                          checked={Boolean(item.destacado)}
                          onChange={(e) =>
                            actualizarLocal(item.id, {
                              destacado: e.target.checked,
                            })
                          }
                          className="h-5 w-5 accent-[#22341c]"
                        />
                      </label>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Orden destacado
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.orden_destacado ?? ""}
                          onChange={(e) =>
                            actualizarLocal(item.id, {
                              orden_destacado: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                          placeholder="Ej. 1"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Desde
                          </label>
                          <input
                            type="date"
                            value={toDateInputValue(item.destacado_desde)}
                            onChange={(e) =>
                              actualizarLocal(item.id, {
                                destacado_desde: e.target.value || null,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Hasta
                          </label>
                          <input
                            type="date"
                            value={toDateInputValue(item.destacado_hasta)}
                            onChange={(e) =>
                              actualizarLocal(item.id, {
                                destacado_hasta: e.target.value || null,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => guardarDestacado(item)}
                        disabled={guardando}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22341c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        {guardando ? "Guardando..." : "Guardar configuración"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
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
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
        {value}
      </p>
    </div>
  );
}