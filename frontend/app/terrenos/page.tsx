"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";

interface Terreno {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion?: string;
  municipio?: string;
  estado_region?: string;
  tipo?: string;
  uso_suelo?: string;
  area_m2?: number;
  imagen_principal?: string;
  estado?: string;
}

export default function TerrenosPage() {
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroTamano, setFiltroTamano] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    const fetchTerrenos = async () => {
      try {
        setCargando(true);

        const response = await fetch("http://localhost:5000/api/terrenos");
        const data = await response.json();

        const soloVisibles = Array.isArray(data)
          ? data.filter((terreno) => {
              const estado = (terreno.estado || "").toLowerCase();
              return estado === "aprobado" || estado === "";
            })
          : [];

        setTerrenos(soloVisibles);
      } catch (error) {
        console.error("Error al cargar terrenos:", error);
        setTerrenos([]);
      } finally {
        setCargando(false);
      }
    };

    fetchTerrenos();
  }, []);

  const toggleFavorito = (id: number) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const ubicacionesUnicas = useMemo(() => {
    const valores = terrenos
      .map((t) => t.municipio || t.ubicacion || t.estado_region || "")
      .filter(Boolean);

    return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b));
  }, [terrenos]);

  const tiposUnicos = useMemo(() => {
    const valores = terrenos
      .map((t) => t.uso_suelo || t.tipo || "")
      .filter(Boolean);

    return Array.from(new Set(valores)).sort((a, b) => a.localeCompare(b));
  }, [terrenos]);

  const terrenosFiltrados = useMemo(() => {
    let resultado = [...terrenos];

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((terreno) => {
        const titulo = (terreno.titulo || "").toLowerCase();
        const descripcion = (terreno.descripcion || "").toLowerCase();
        const ubicacion = (terreno.ubicacion || "").toLowerCase();
        const municipio = (terreno.municipio || "").toLowerCase();
        const estadoRegion = (terreno.estado_region || "").toLowerCase();
        const tipo = (terreno.uso_suelo || terreno.tipo || "").toLowerCase();

        return (
          titulo.includes(texto) ||
          descripcion.includes(texto) ||
          ubicacion.includes(texto) ||
          municipio.includes(texto) ||
          estadoRegion.includes(texto) ||
          tipo.includes(texto)
        );
      });
    }

    if (filtroUbicacion !== "todas") {
      resultado = resultado.filter((terreno) => {
        const valor = (
          terreno.municipio ||
          terreno.ubicacion ||
          terreno.estado_region ||
          ""
        ).toLowerCase();

        return valor === filtroUbicacion.toLowerCase();
      });
    }

    if (filtroTipo !== "todos") {
      resultado = resultado.filter(
        (terreno) =>
          (terreno.uso_suelo || terreno.tipo || "").toLowerCase() ===
          filtroTipo.toLowerCase()
      );
    }

    if (filtroPrecio !== "todos") {
      resultado = resultado.filter((terreno) => {
        const precio = Number(terreno.precio || 0);

        switch (filtroPrecio) {
          case "0-500000":
            return precio <= 500000;
          case "500000-1000000":
            return precio > 500000 && precio <= 1000000;
          case "1000000-3000000":
            return precio > 1000000 && precio <= 3000000;
          case "3000000+":
            return precio > 3000000;
          default:
            return true;
        }
      });
    }

    if (filtroTamano !== "todos") {
      resultado = resultado.filter((terreno) => {
        const area = Number(terreno.area_m2 || 0);

        switch (filtroTamano) {
          case "0-250":
            return area > 0 && area <= 250;
          case "250-500":
            return area > 250 && area <= 500;
          case "500-1000":
            return area > 500 && area <= 1000;
          case "1000+":
            return area > 1000;
          default:
            return true;
        }
      });
    }

    resultado.sort((a, b) => {
      switch (orden) {
        case "precio_menor":
          return Number(a.precio || 0) - Number(b.precio || 0);
        case "precio_mayor":
          return Number(b.precio || 0) - Number(a.precio || 0);
        case "titulo_az":
          return (a.titulo || "").localeCompare(b.titulo || "");
        case "titulo_za":
          return (b.titulo || "").localeCompare(a.titulo || "");
        case "recientes":
        default:
          return b.id - a.id;
      }
    });

    return resultado;
  }, [
    terrenos,
    busqueda,
    filtroUbicacion,
    filtroTipo,
    filtroPrecio,
    filtroTamano,
    orden,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroUbicacion("todas");
    setFiltroTipo("todos");
    setFiltroPrecio("todos");
    setFiltroTamano("todos");
    setOrden("recientes");
  };

  const hayFiltrosActivos =
    busqueda.trim() ||
    filtroUbicacion !== "todas" ||
    filtroTipo !== "todos" ||
    filtroPrecio !== "todos" ||
    filtroTamano !== "todos" ||
    orden !== "recientes";

  const getImagenTerreno = (img?: string) => {
    if (!img) return "/images/terreno-placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000${img}`;
  };

  const Filtros = () => (
    <>
      <select
        value={filtroUbicacion}
        onChange={(e) => setFiltroUbicacion(e.target.value)}
        className="h-11 rounded-xl border border-[#99B5D2]/25 bg-white px-3 text-sm text-[#003554] outline-none transition focus:ring-2 focus:ring-[#99B5D2]"
      >
        <option value="todas">Ubicación</option>
        {ubicacionesUnicas.map((ubicacion) => (
          <option key={ubicacion} value={ubicacion}>
            {ubicacion}
          </option>
        ))}
      </select>

      <select
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
        className="h-11 rounded-xl border border-[#99B5D2]/25 bg-white px-3 text-sm text-[#003554] outline-none transition focus:ring-2 focus:ring-[#99B5D2]"
      >
        <option value="todos">Tipo</option>
        {tiposUnicos.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>

      <select
        value={filtroPrecio}
        onChange={(e) => setFiltroPrecio(e.target.value)}
        className="h-11 rounded-xl border border-[#99B5D2]/25 bg-white px-3 text-sm text-[#003554] outline-none transition focus:ring-2 focus:ring-[#99B5D2]"
      >
        <option value="todos">Precio</option>
        <option value="0-500000">Hasta $500 mil</option>
        <option value="500000-1000000">$500 mil - $1 M</option>
        <option value="1000000-3000000">$1 M - $3 M</option>
        <option value="3000000+">Más de $3 M</option>
      </select>

      <select
        value={filtroTamano}
        onChange={(e) => setFiltroTamano(e.target.value)}
        className="h-11 rounded-xl border border-[#99B5D2]/25 bg-white px-3 text-sm text-[#003554] outline-none transition focus:ring-2 focus:ring-[#99B5D2]"
      >
        <option value="todos">Área</option>
        <option value="0-250">Hasta 250 m²</option>
        <option value="250-500">250 - 500 m²</option>
        <option value="500-1000">500 - 1000 m²</option>
        <option value="1000+">Más de 1000 m²</option>
      </select>

      <select
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        className="h-11 rounded-xl border border-[#99B5D2]/25 bg-white px-3 text-sm text-[#003554] outline-none transition focus:ring-2 focus:ring-[#99B5D2]"
      >
        <option value="recientes">Ordenar</option>
        <option value="precio_menor">Precio ↑</option>
        <option value="precio_mayor">Precio ↓</option>
        <option value="titulo_az">A - Z</option>
        <option value="titulo_za">Z - A</option>
      </select>
    </>
  );

  return (
    <main className="min-h-screen bg-[#f8fafb] px-4 pb-14 pt-18 md:px-6">
      <section className="mx-auto max-w-7xl">
        {/* Header corto */}
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#003554] md:text-3xl">
              Terrenos disponibles
            </h1>
            <p className="mt-1 text-sm text-[#426C8E]">
              {cargando
                ? "Cargando publicaciones..."
                : `${terrenosFiltrados.length} resultados disponibles`}
            </p>
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-[#426C8E] transition hover:bg-[#99B5D2]/10"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Toolbar desktop */}
        <div className="mb-8 hidden rounded-2xl border border-[#99B5D2]/20 bg-white p-3 shadow-sm md:block">
          <div className="grid grid-cols-[1.5fr_repeat(5,minmax(0,1fr))] gap-3">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-[#99B5D2]/25 bg-white px-3">
              <Search size={16} className="text-[#426C8E]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar terrenos..."
                className="w-full bg-transparent text-sm text-[#003554] outline-none placeholder:text-[#426C8E]/70"
              />
            </div>

            <Filtros />
          </div>
        </div>

        {/* Toolbar mobile */}
        <div className="mb-6 space-y-3 md:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-[#99B5D2]/20 bg-white p-3 shadow-sm">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#99B5D2]/25 bg-white px-3">
              <Search size={16} className="text-[#426C8E]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-[#003554] outline-none placeholder:text-[#426C8E]/70"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltrosMobile((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99B5D2]/25 bg-white text-[#003554]"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <AnimatePresence>
            {mostrarFiltrosMobile && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-[#99B5D2]/20 bg-white p-3 shadow-sm"
              >
                <Filtros />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        {cargando ? (
          <div className="rounded-2xl border border-[#99B5D2]/20 bg-white p-10 text-center text-[#426C8E] shadow-sm">
            Cargando terrenos...
          </div>
        ) : terrenosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-[#99B5D2]/20 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-[#003554]">
              No se encontraron resultados
            </h3>
            <p className="mt-2 text-sm text-[#426C8E]">
              Ajusta tu búsqueda o cambia los filtros.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {terrenosFiltrados.map((terreno, index) => {
              const imagen = getImagenTerreno(terreno.imagen_principal);

              const ubicacionVisible =
                [terreno.municipio, terreno.estado_region]
                  .filter(Boolean)
                  .join(", ") ||
                terreno.ubicacion ||
                "Ubicación no definida";

              return (
                <motion.article
                  key={terreno.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.02 }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-[1.4rem] bg-white transition"
                >
                  <div className="relative overflow-hidden rounded-[1.35rem]">
                    <img
                      src={imagen}
                      alt={terreno.titulo}
                      loading="lazy"
                      className="h-52 w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    <button
                      type="button"
                      onClick={() => toggleFavorito(terreno.id)}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-sm transition hover:scale-105"
                    >
                      <motion.span
                        animate={{
                          scale: favoritos.includes(terreno.id) ? [1, 1.15, 1] : 1,
                        }}
                        transition={{ duration: 0.25 }}
                      >
                        <Bookmark
                          size={18}
                          className={
                            favoritos.includes(terreno.id)
                              ? "fill-[#003554] text-[#003554]"
                              : "text-[#003554]"
                          }
                          strokeWidth={2}
                        />
                      </motion.span>
                    </button>

                    <span className="absolute bottom-3 left-3 rounded-full bg-[#003554] px-3 py-1 text-[11px] font-medium text-white">
                      {terreno.uso_suelo || terreno.tipo || "Terreno"}
                    </span>
                  </div>

                  <div className="px-2 pb-2 pt-3">
                    <h2 className="line-clamp-1 text-[1.05rem] font-semibold text-[#003554]">
                      {terreno.titulo}
                    </h2>

                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#426C8E]">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{ubicacionVisible}</span>
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {terreno.descripcion || "Sin descripción disponible."}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[1.7rem] font-bold tracking-tight text-[#003554]">
                          ${Number(terreno.precio || 0).toLocaleString("es-MX")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {terreno.area_m2
                            ? `${Math.round(terreno.area_m2)} m²`
                            : "Área no disponible"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={`/terrenos/${terreno.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#003554] transition hover:text-[#426C8E]"
                      >
                        Ver detalle
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}