"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  MapPin,
  User,
  Mail,
  BadgeDollarSign,
  Eye,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

const MapaAdminMap = dynamic(() => import("./mapaAdminMap"), {
  ssr: false,
});

interface TerrenoAdminMapa {
  id: number;
  titulo: string;
  estado: string;
  precio?: number | null;
  ubicacion?: string | null;
  municipio?: string | null;
  estado_region?: string | null;
  centro_lat?: number | string | null;
  centro_lng?: number | string | null;
  area_m2?: number | string | null;
  tipo?: string | null;
  uso_suelo?: string | null;
  imagen_principal?: string | null;
  usuario?: string | null;
  usuario_email?: string | null;
}

export default function MapaAdminClient() {
  const [terrenos, setTerrenos] = useState<TerrenoAdminMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchTerrenos = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/api/admin/publicaciones");

      setTerrenos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mapa admin:", error);
      setTerrenos([]);
      setError("No fue posible cargar las publicaciones del mapa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerrenos();
  }, []);

  const terrenosValidos = useMemo(() => {
    return terrenos.filter((t) => {
      const lat = Number(t.centro_lat);
      const lng = Number(t.centro_lng);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [terrenos]);

  const terrenosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return terrenosValidos.filter((t) => {
      const matchEstado =
        estado === "todos" || t.estado?.toLowerCase() === estado;

      const texto = [
        t.id,
        t.titulo,
        t.estado,
        t.ubicacion,
        t.municipio,
        t.estado_region,
        t.usuario,
        t.usuario_email,
        t.tipo,
        t.uso_suelo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchBusqueda = !q || texto.includes(q);

      return matchEstado && matchBusqueda;
    });
  }, [terrenosValidos, busqueda, estado]);

  const terrenoSeleccionado = terrenosFiltrados.find(
    (t) => t.id === selectedId
  );

  const formatMoney = (value?: number | string | null) => {
    if (value === null || value === undefined) return "Sin precio";
    return `$${Number(value).toLocaleString("es-MX")}`;
  };

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#817d58]">
            Mapa administrativo
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Publicaciones en mapa
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Visualiza terrenos publicados junto con los datos del colaborador.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTerrenos}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, ubicación, colaborador, correo o ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:bg-white"
          />
        </div>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
          <option value="pausado">Pausados</option>
        </select>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid h-[calc(100dvh-260px)] min-h-[620px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              {loading
                ? "Cargando publicaciones..."
                : `${terrenosFiltrados.length} publicaciones visibles`}
            </p>
          </div>

          <div className="space-y-3 p-4">
            {!loading && terrenosFiltrados.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                No hay terrenos con coordenadas para mostrar.
              </div>
            )}

            {terrenosFiltrados.map((t) => (
              <article
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`cursor-pointer rounded-2xl border bg-white p-3 transition hover:shadow-md ${
                  selectedId === t.id
                    ? "border-[#828d4b] ring-2 ring-[#828d4b]/20"
                    : "border-slate-200"
                }`}
              >
                <div className="flex gap-3">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {t.imagen_principal ? (
                      <img
                        src={
                          t.imagen_principal.startsWith("http")
                            ? t.imagen_principal
                            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${t.imagen_principal}`
                        }
                        alt={t.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">
                      #{t.id} · {formatMoney(t.precio)}
                    </p>

                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-[#22341c]">
                      {t.titulo}
                    </h2>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {t.municipio || t.ubicacion || "Ubicación no disponible"}
                      </span>
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                      <User className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {t.usuario || "Colaborador no disponible"}
                      </span>
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {t.usuario_email || "Correo no disponible"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                    {t.estado}
                  </span>

                  <Link
                    href={`/admin/publicaciones/${t.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full bg-[#22341c] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#828d4b]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="relative min-h-[420px] min-w-0">
          <MapaAdminMap
            terrenos={terrenosFiltrados}
            selectedId={selectedId}
            onSelectTerreno={setSelectedId}
          />

          {terrenoSeleccionado && (
            <div className="absolute bottom-5 left-5 z-[500] max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#817d58]">
                Seleccionado
              </p>

              <h3 className="mt-1 line-clamp-2 font-semibold text-slate-800">
                {terrenoSeleccionado.titulo}
              </h3>

              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <BadgeDollarSign className="h-4 w-4 text-[#828d4b]" />
                  {formatMoney(terrenoSeleccionado.precio)}
                </p>

                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#828d4b]" />
                  {terrenoSeleccionado.usuario || "Colaborador no disponible"}
                </p>

                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#828d4b]" />
                  {terrenoSeleccionado.usuario_email || "Correo no disponible"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}