"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ZonasFiltersBar from "./zonasFiltersBar";
import TerrenoMapCard from "./terrenoMapCard";
import { FiltrosMapa, MapBounds, TerrenoMapa } from "./types";

const ZonasMap = dynamic(() => import("./zonasMap"), {
  ssr: false,
});

const API_URL = "http://localhost:5000/api/terrenos/mapa";
const MAP_DEBOUNCE_MS = 700;
type RegionConfig = {
  slug: string;
  nombre: string;
  center: [number, number];
  zoom: number;
  bounds?: MapBounds;
  estados: string[];
  municipios: string[];
};

const REGION_CONFIGS: Record<string, RegionConfig> = {
  bajio: {
    slug: "bajio",
    nombre: "Bajío",
    center: [21.019, -101.257],
    zoom: 8,
    bounds: {
      north: 22.7,
      south: 20.0,
      east: -99.5,
      west: -102.8,
    },
    estados: [
      "guanajuato",
      "queretaro",
      "querétaro",
      "aguascalientes",
      "san luis potosi",
      "san luis potosí",
    ],
    municipios: [
      "leon",
      "león",
      "irapuato",
      "celaya",
      "salamanca",
      "guanajuato",
      "san miguel de allende",
      "queretaro",
      "querétaro",
      "san juan del rio",
      "san juan del río",
      "aguascalientes",
      "san luis potosi",
      "san luis potosí",
    ],
  },

  norte: {
    slug: "norte",
    nombre: "Norte",
    center: [27.5, -103.5],
    zoom: 6,
    bounds: {
      north: 32.9,
      south: 24.0,
      east: -96.5,
      west: -117.5,
    },
    estados: [
      "nuevo leon",
      "nuevo león",
      "chihuahua",
      "coahuila",
      "sonora",
      "baja california",
      "tamaulipas",
    ],
    municipios: [
      "monterrey",
      "san nicolas",
      "san nicolás",
      "apodaca",
      "chihuahua",
      "ciudad juarez",
      "ciudad juárez",
      "saltillo",
      "torreon",
      "torreón",
      "hermosillo",
      "tijuana",
      "reynosa",
      "matamoros",
      "nuevo laredo",
    ],
  },

  occidente: {
    slug: "occidente",
    nombre: "Occidente",
    center: [20.67, -103.35],
    zoom: 7,
    bounds: {
      north: 23.4,
      south: 17.8,
      east: -101.0,
      west: -106.8,
    },
    estados: [
      "jalisco",
      "nayarit",
      "colima",
      "michoacan",
      "michoacán",
    ],
    municipios: [
      "guadalajara",
      "zapopan",
      "tlajomulco",
      "puerto vallarta",
      "tepic",
      "colima",
      "manzanillo",
      "morelia",
      "zamora",
    ],
  },

  sureste: {
    slug: "sureste",
    nombre: "Sureste",
    center: [19.2, -89.6],
    zoom: 6,
    bounds: {
      north: 22.8,
      south: 14.5,
      east: -86.5,
      west: -94.8,
    },
    estados: [
      "yucatan",
      "yucatán",
      "quintana roo",
      "campeche",
      "tabasco",
      "chiapas",
    ],
    municipios: [
      "merida",
      "mérida",
      "cancun",
      "cancún",
      "playa del carmen",
      "tulum",
      "campeche",
      "villahermosa",
      "tuxtla gutierrez",
      "tuxtla gutiérrez",
    ],
  },

  centro: {
    slug: "centro",
    nombre: "Centro",
    center: [19.43, -99.13],
    zoom: 8,
    bounds: {
      north: 21.2,
      south: 18.1,
      east: -97.0,
      west: -100.9,
    },
    estados: [
      "ciudad de mexico",
      "ciudad de méxico",
      "cdmx",
      "estado de mexico",
      "estado de méxico",
      "morelos",
      "puebla",
      "hidalgo",
      "tlaxcala",
    ],
    municipios: [
      "ciudad de mexico",
      "ciudad de méxico",
      "cdmx",
      "toluca",
      "metepec",
      "cuernavaca",
      "puebla",
      "pachuca",
      "tlaxcala",
    ],
  },

  frontera: {
    slug: "frontera",
    nombre: "Frontera",
    center: [29.0, -107.0],
    zoom: 6,
    bounds: {
      north: 32.8,
      south: 25.3,
      east: -97.0,
      west: -117.2,
    },
    estados: [
      "baja california",
      "sonora",
      "chihuahua",
      "coahuila",
      "nuevo leon",
      "nuevo león",
      "tamaulipas",
    ],
    municipios: [
      "tijuana",
      "mexicali",
      "nogales",
      "ciudad juarez",
      "ciudad juárez",
      "piedras negras",
      "reynosa",
      "matamoros",
      "nuevo laredo",
    ],
  },
};

type FocusRequest = {
  id: number;
  source: "card" | "marker";
  nonce: number;
} | null;

function areBoundsEqual(a: MapBounds | null, b: MapBounds | null) {
  if (!a || !b) return false;

  return (
    Math.abs(a.north - b.north) < 0.00001 &&
    Math.abs(a.south - b.south) < 0.00001 &&
    Math.abs(a.east - b.east) < 0.00001 &&
    Math.abs(a.west - b.west) < 0.00001
  );
}

function normalizeText(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
function terrenoMatchesRegion(
  terreno: TerrenoMapa,
  region: RegionConfig | null
) {
  if (!region) return true;

  const estado = normalizeText((terreno as any).estado_region);
  const municipio = normalizeText((terreno as any).municipio);
  const ubicacion = normalizeText((terreno as any).ubicacion);

  const estadosPermitidos = region.estados.map(normalizeText);
  const municipiosPermitidos = region.municipios.map(normalizeText);

  const matchEstado = estado
    ? estadosPermitidos.includes(estado)
    : false;

  const matchMunicipio = municipio
    ? municipiosPermitidos.includes(municipio)
    : false;

  const matchUbicacion = ubicacion
    ? estadosPermitidos.some((e) => ubicacion.includes(e)) ||
      municipiosPermitidos.some((m) => ubicacion.includes(m))
    : false;

  return matchEstado || matchMunicipio || matchUbicacion;
}

export default function ZonasClient() {
  const [terrenos, setTerrenos] = useState<TerrenoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openPopupId, setOpenPopupId] = useState<number | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  const [filtros, setFiltros] = useState<FiltrosMapa>({
    q: "",
    tipo: "",
    precioMin: "",
    precioMax: "",
  });

  const [errorMapa, setErrorMapa] = useState<string | null>(null);

  const cardsRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(false);
  const firstLoadRef = useRef(false);
  const lastFetchKeyRef = useRef<string | null>(null);
  const currentBoundsRef = useRef<MapBounds | null>(null);

  const normalizeFiltros = (source: FiltrosMapa): FiltrosMapa => ({
    q: source.q.trim(),
    tipo: source.tipo.trim(),
    precioMin: source.precioMin.trim(),
    precioMax: source.precioMax.trim(),
  });

  const buildFetchKey = (bounds: MapBounds, filtrosActivos: FiltrosMapa) => {
    const filtrosNormalizados = normalizeFiltros(filtrosActivos);

    return JSON.stringify({
      north: Number(bounds.north.toFixed(6)),
      south: Number(bounds.south.toFixed(6)),
      east: Number(bounds.east.toFixed(6)),
      west: Number(bounds.west.toFixed(6)),
      ...filtrosNormalizados,
    });
  };

  const fetchTerrenosMapa = async (
    bounds: MapBounds,
    filtrosActivos: FiltrosMapa
  ) => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setErrorMapa(null);

      const filtrosNormalizados = normalizeFiltros(filtrosActivos);

      const params = new URLSearchParams({
        north: String(bounds.north),
        south: String(bounds.south),
        east: String(bounds.east),
        west: String(bounds.west),
      });

      if (filtrosNormalizados.q) params.append("q", filtrosNormalizados.q);
      if (filtrosNormalizados.tipo) params.append("tipo", filtrosNormalizados.tipo);
      if (filtrosNormalizados.precioMin) params.append("precioMin", filtrosNormalizados.precioMin);
      if (filtrosNormalizados.precioMax) params.append("precioMax", filtrosNormalizados.precioMax);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${rawText}`);
      }

      const data: TerrenoMapa[] = JSON.parse(rawText);

      if (requestId !== requestIdRef.current) return;

      setTerrenos(data);

      setSelectedId((prevSelected) => {
        if (!data.length) return null;
        if (prevSelected && data.some((t) => t.id === prevSelected)) {
          return prevSelected;
        }
        return data[0].id;
      });

      setOpenPopupId((prev) => {
        if (!prev) return null;
        return data.some((t) => t.id === prev) ? prev : null;
      });
    } catch {
      if (requestId !== requestIdRef.current) return;

      setTerrenos([]);
      setSelectedId(null);
      setOpenPopupId(null);
      setErrorMapa("Ocurrió un error al cargar los terrenos del mapa.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region");
  const activeRegion = regionParam ? REGION_CONFIGS[regionParam] ?? null : null;

    useEffect(() => {
    if (regionParam) {
      console.log("REGION DETECTADA:", regionParam);
    }
  }, [regionParam]);
  useEffect(() => {
  if (activeRegion) {
    console.log("CONFIG REGION ACTIVA:", activeRegion);
  }
}, [activeRegion]);


  useEffect(() => {
    mountedRef.current = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }

    return () => {
      mountedRef.current = false;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentBounds) return;

    const currentKey = buildFetchKey(currentBounds, filtros);

    if (!firstLoadRef.current) {
      firstLoadRef.current = true;
      lastFetchKeyRef.current = currentKey;
      fetchTerrenosMapa(currentBounds, filtros);
      return;
    }

    if (lastFetchKeyRef.current === currentKey) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      lastFetchKeyRef.current = currentKey;
      fetchTerrenosMapa(currentBounds, filtros);
    }, MAP_DEBOUNCE_MS);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [currentBounds, filtros]);

  const terrenosOrdenados = useMemo(() => {
    if (!activeRegion) return terrenos;

    return terrenos.filter((terreno) =>
      terrenoMatchesRegion(terreno, activeRegion)
    );
  }, [terrenos, activeRegion]);

  const ensureCardVisible = (id: number) => {
    const node = cardsRefs.current[id];
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (!isVisible) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleCardClick = (id: number) => {
    setSelectedId(id);
    setOpenPopupId(null);
    setFocusRequest({
      id,
      source: "card",
      nonce: Date.now(),
    });
    ensureCardVisible(id);
  };

  const handleMarkerClick = (id: number) => {
    setSelectedId(id);
    setOpenPopupId(id);
    setFocusRequest({
      id,
      source: "marker",
      nonce: Date.now(),
    });
    ensureCardVisible(id);
  };

  const handleBuscarZona = async () => {
    if (!currentBounds) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    lastFetchKeyRef.current = buildFetchKey(currentBounds, filtros);
    await fetchTerrenosMapa(currentBounds, filtros);
  };

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    if (areBoundsEqual(currentBoundsRef.current, bounds)) return;

    currentBoundsRef.current = bounds;
    setCurrentBounds(bounds);
  }, []);

    return (
    <main className="h-[calc(100dvh-var(--navbar-safe-offset))] overflow-hidden">
      <div className="flex h-full min-h-0 flex-col">
        <ZonasFiltersBar
          filtros={filtros}
          setFiltros={setFiltros}
          total={terrenosOrdenados.length}
          onBuscarZona={handleBuscarZona}
          loading={loading}
          hasPendingChanges={false}
          onLimpiarFiltros={() =>
            setFiltros({
              q: "",
              tipo: "",
              precioMin: "",
              precioMax: "",
            })
          }
        />

        <section className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[420px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-r border-[#ddd6c7] bg-[#fcfbf8]">
            <div className="space-y-3 p-4">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl border border-[#e8e2d7] bg-white"
                  />
                ))}

              {errorMapa && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMapa}
                </div>
              )}

              {!loading && !errorMapa && terrenosOrdenados.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#d8d0bf] bg-white p-6 text-center">
                  <h3 className="text-base font-semibold text-[#22341c]">
                    No hay terrenos en esta vista
                  </h3>
                  <p className="mt-2 text-sm text-[#817d58]">
                    Mueve el mapa o ajusta los filtros. Los resultados se actualizan
                    automáticamente según la zona visible.
                  </p>
                </div>
              )}

              {!loading &&
                !errorMapa &&
                terrenosOrdenados.map((terreno) => (
                  <div
                    key={terreno.id}
                    ref={(el) => {
                      cardsRefs.current[terreno.id] = el;
                    }}
                  >
                    <TerrenoMapCard
                      terreno={terreno}
                      isSelected={selectedId === terreno.id}
                      isHovered={hoveredId === terreno.id}
                      onSelect={handleCardClick}
                      onHoverChange={(hovering: boolean) => {
                        if (hovering) {
                          setHoveredId(terreno.id);
                        } else {
                          setHoveredId((prev) =>
                            prev === terreno.id ? null : prev
                          );
                        }
                      }}
                    />
                  </div>
                ))}
            </div>
          </aside>

          <div className="min-h-[320px] min-w-0 lg:min-h-0">
            <ZonasMap
              terrenos={terrenosOrdenados}
              selectedId={selectedId}
              hoveredId={hoveredId}
              openPopupId={openPopupId}
              focusRequest={focusRequest}
              onSelectTerreno={handleMarkerClick}
              onBoundsChange={handleBoundsChange}
              onClosePopup={() => setOpenPopupId(null)}
              userLocation={userLocation}
              initialCenter={activeRegion?.center ?? null}
              initialZoom={activeRegion?.zoom ?? null}
              initialBounds={activeRegion?.bounds ?? null}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
