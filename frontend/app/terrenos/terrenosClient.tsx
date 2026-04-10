"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ArrowRight,
  LandPlot,
} from "lucide-react";
import FavoriteButton from "@/components/terrenos/favoriteButton";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function normalizeText(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function TerrenosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);

  const [busqueda, setBusqueda] = useState(
    searchParams.get("search") || searchParams.get("q") || ""
  );
  const [filtroUbicacion, setFiltroUbicacion] = useState(
    searchParams.get("ubicacion") || "todas"
  );
  const [filtroTipo, setFiltroTipo] = useState(
    searchParams.get("tipo") || "todos"
  );
  const [filtroPrecio, setFiltroPrecio] = useState(
    searchParams.get("precio") || "todos"
  );
  const [filtroTamano, setFiltroTamano] = useState(
    searchParams.get("area") || "todos"
  );
  const [orden, setOrden] = useState(searchParams.get("orden") || "recientes");

  useEffect(() => {
  const fetchTerrenos = async () => {
    try {
      setCargando(true);

      const params = new URLSearchParams();

      if (busqueda.trim()) params.set("q", busqueda.trim());
      if (filtroUbicacion !== "todas") params.set("ubicacion", filtroUbicacion);
      if (filtroTipo !== "todos") params.set("tipo", filtroTipo);
      if (filtroPrecio !== "todos") params.set("precio", filtroPrecio);
      if (filtroTamano !== "todos") params.set("area", filtroTamano);
      if (orden !== "recientes") params.set("orden", orden);

      const response = await fetch(
        `${API_URL}/api/terrenos/search?${params.toString()}`
      );

      const data = await response.json();

      setTerrenos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar terrenos:", error);
      setTerrenos([]);
    } finally {
      setCargando(false);
    }
  };

  fetchTerrenos();
}, [
  busqueda,
  filtroUbicacion,
  filtroTipo,
  filtroPrecio,
  filtroTamano,
  orden,
]);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    const ubicacion = searchParams.get("ubicacion") || "todas";
    const tipo = searchParams.get("tipo") || "todos";
    const precio = searchParams.get("precio") || "todos";
    const area = searchParams.get("area") || "todos";
    const ordenUrl = searchParams.get("orden") || "recientes";

    setBusqueda(q);
    setFiltroUbicacion(ubicacion);
    setFiltroTipo(tipo);
    setFiltroPrecio(precio);
    setFiltroTamano(area);
    setOrden(ordenUrl);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    

    if (busqueda.trim()) params.set("search", busqueda.trim());
    if (filtroUbicacion !== "todas") params.set("ubicacion", filtroUbicacion);
    if (filtroTipo !== "todos") params.set("tipo", filtroTipo);
    if (filtroPrecio !== "todos") params.set("precio", filtroPrecio);
    if (filtroTamano !== "todos") params.set("area", filtroTamano);
    if (orden !== "recientes") params.set("orden", orden);

    const query = params.toString();
    router.replace(query ? `/terrenos?${query}` : "/terrenos", { scroll: false });
  }, [
    busqueda,
    filtroUbicacion,
    filtroTipo,
    filtroPrecio,
    filtroTamano,
    orden,
    router,
  ]);

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
    let resultado = terrenos.filter(
    (t) => t.estado?.toLowerCase() === "aprobado"
  );

    if (busqueda.trim()) {
      const texto = normalizeText(busqueda);

      resultado = resultado.filter((terreno) => {
        const titulo = normalizeText(terreno.titulo);
        const descripcion = normalizeText(terreno.descripcion);
        const ubicacion = normalizeText(terreno.ubicacion);
        const municipio = normalizeText(terreno.municipio);
        const estadoRegion = normalizeText(terreno.estado_region);
        const tipo = normalizeText(terreno.tipo);
        const usoSuelo = normalizeText(terreno.uso_suelo);

        return (
          titulo.includes(texto) ||
          descripcion.includes(texto) ||
          ubicacion.includes(texto) ||
          municipio.includes(texto) ||
          estadoRegion.includes(texto) ||
          tipo.includes(texto) ||
          usoSuelo.includes(texto)
        );
      });
    }


    if (filtroUbicacion !== "todas") {
      const ubicacionFiltro = normalizeText(filtroUbicacion);

      resultado = resultado.filter((terreno) => {
        const valor = normalizeText(
          terreno.municipio || terreno.ubicacion || terreno.estado_region || ""
        );

        return valor === ubicacionFiltro;
      });
    }

    if (filtroTipo !== "todos") {
      const tipoFiltro = normalizeText(filtroTipo);

      resultado = resultado.filter((terreno) => {
        const valor = normalizeText(terreno.uso_suelo || terreno.tipo || "");
        return valor === tipoFiltro;
      });
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
    !!busqueda.trim() ||
    filtroUbicacion !== "todas" ||
    filtroTipo !== "todos" ||
    filtroPrecio !== "todos" ||
    filtroTamano !== "todos" ||
    orden !== "recientes";

  const getImagenTerreno = (img?: string | null) => {
    if (!img || !img.trim()) return "/images/terreno-placeholder.png";

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }

    if (img.startsWith("/")) {
      return `${API_URL}${img}`;
    }

    return `${API_URL}/${img}`;
  };

  const Filtros = () => (
    <>
      <select
        value={filtroUbicacion}
        onChange={(e) => setFiltroUbicacion(e.target.value)}
        className="h-11 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
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
        className="h-11 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
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
        className="h-11 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
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
        className="h-11 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
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
        className="h-11 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
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
    <main className="min-h-screen bg-[#f7f6f1] px-4 pb-14 pt-20 md:px-6">
      <section className="container-page-wide">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-[#817d58]/12 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#22341c] via-[#2f4727] to-[#828d4b] px-6 py-8 text-white md:px-8 md:py-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/95">
              <LandPlot size={14} />
              Marketplace de terrenos
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Terrenos disponibles
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                  Explora oportunidades de inversión, vivienda o desarrollo con
                  filtros precisos y una experiencia visual más clara.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                  Resultados
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {cargando ? "..." : terrenosFiltrados.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-[#817d58]">
              {cargando
                ? "Cargando publicaciones..."
                : `${terrenosFiltrados.length} terrenos visibles en esta búsqueda`}
            </p>
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#817d58]/15 bg-white px-3 py-2 text-sm font-medium text-[#22341c] transition hover:bg-[#f2efe6]"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {busqueda.trim() && (
            <span className="rounded-full bg-[#ece8dd] px-3 py-1 text-xs text-[#22341c]">
              Búsqueda: {busqueda}
            </span>
          )}
          {filtroTipo !== "todos" && (
            <span className="rounded-full bg-[#ece8dd] px-3 py-1 text-xs text-[#22341c]">
              Tipo: {filtroTipo}
            </span>
          )}
          {filtroUbicacion !== "todas" && (
            <span className="rounded-full bg-[#ece8dd] px-3 py-1 text-xs text-[#22341c]">
              Ubicación: {filtroUbicacion}
            </span>
          )}
        </div>

        <div className="mb-8 hidden rounded-[1.75rem] border border-[#817d58]/12 bg-white p-3 shadow-sm md:block">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(320px,1.8fr)_repeat(5,minmax(140px,1fr))]">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3">
              <Search size={16} className="text-[#817d58]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, ubicación, tipo o descripción..."
                className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]/70"
              />
            </div>

            <Filtros />
          </div>
        </div>

        <div className="mb-6 space-y-3 md:hidden">
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-[#817d58]/12 bg-white p-3 shadow-sm">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] px-3">
              <Search size={16} className="text-[#817d58]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]/70"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltrosMobile((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#817d58]/18 bg-[#f7f6f1] text-[#22341c]"
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
                className="grid grid-cols-1 gap-3 rounded-[1.6rem] border border-[#817d58]/12 bg-white p-3 shadow-sm"
              >
                <Filtros />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {cargando ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando terrenos...
          </div>
        ) : terrenosFiltrados.length === 0 ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-[#22341c]">
              No se encontraron resultados
            </h3>
            <p className="mt-2 text-sm text-[#817d58]">
              Ajusta tu búsqueda o cambia los filtros para descubrir más
              terrenos disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {terrenosFiltrados.map((terreno, index) => {
              const imagen = getImagenTerreno(terreno.imagen_principal);

              const ubicacionVisible =
                [terreno.municipio, terreno.estado_region]
                  .filter(Boolean)
                  .join(", ") ||
                terreno.ubicacion ||
                "Ubicación no definida";

              const tipoVisible =
                terreno.uso_suelo || terreno.tipo || "Terreno";

              return (
                <motion.article
                  key={terreno.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.02 }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-[1.7rem] border border-[#817d58]/10 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={imagen}
                      alt={terreno.titulo}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/images/terreno-placeholder.jpg";
                      }}
                      className="h-56 w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#22341c]/45 via-transparent to-transparent" />

                    <div className="absolute right-3 top-3 z-10">
                      <FavoriteButton
                        terrenoId={terreno.id}
                        size={18}
                        className="bg-white/90 shadow-sm backdrop-blur-md"
                        activeClassName="bg-white text-[#22341c] border-[#9f885c]/30"
                        inactiveClassName="bg-white/90 text-[#22341c] border-[#817d58]/15"
                      />
                    </div>

                    <span className="absolute bottom-3 left-3 rounded-full bg-[#22341c] px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                      {tipoVisible}
                    </span>
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-1 text-[1.05rem] font-semibold text-[#22341c]">
                      {terreno.titulo}
                    </h2>

                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#817d58]">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{ubicacionVisible}</span>
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6c6655]">
                      {terreno.descripcion || "Sin descripción disponible."}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[1.65rem] font-bold tracking-tight text-[#22341c]">
                          ${Number(terreno.precio || 0).toLocaleString("es-MX")}
                        </p>
                        <p className="mt-0.5 text-xs text-[#9f885c]">
                          {terreno.area_m2
                            ? `${Math.round(terreno.area_m2)} m²`
                            : "Área no disponible"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/terrenos/${terreno.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#f7f6f1] px-3 py-2 text-sm font-semibold text-[#22341c] transition hover:bg-[#ece8dd]"
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