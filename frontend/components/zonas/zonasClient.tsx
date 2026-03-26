"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import ZonasFiltersBar from "./zonasFiltersBar";
import TerrenoMapCard from "./terrenoMapCard";
import { FiltrosMapa, MapBounds, TerrenoMapa } from "./types";

const ZonasMap = dynamic(() => import("./zonasMap"), {
  ssr: false,
});

const API_URL = "http://localhost:5000/api/terrenos/mapa";
const MAP_DEBOUNCE_MS = 700;

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

export default function ZonasClient() {
  const [terrenos, setTerrenos] = useState<TerrenoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
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

      if (filtrosNormalizados.q) {
        params.append("q", filtrosNormalizados.q);
      }

      if (filtrosNormalizados.tipo) {
        params.append("tipo", filtrosNormalizados.tipo);
      }

      if (filtrosNormalizados.precioMin) {
        params.append("precioMin", filtrosNormalizados.precioMin);
      }

      if (filtrosNormalizados.precioMax) {
        params.append("precioMax", filtrosNormalizados.precioMax);
      }

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
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      setTerrenos([]);
      setSelectedId(null);
      setErrorMapa("Ocurrió un error al cargar los terrenos del mapa.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

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

    if (lastFetchKeyRef.current === currentKey) {
      return;
    }

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

  const terrenosOrdenados = useMemo(() => terrenos, [terrenos]);

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
    setFocusRequest({
      id,
      source: "card",
      nonce: Date.now(),
    });

    ensureCardVisible(id);
  };

  const handleMarkerClick = (id: number) => {
    setSelectedId(id);
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
    if (areBoundsEqual(currentBoundsRef.current, bounds)) {
      return;
    }

    currentBoundsRef.current = bounds;
    setCurrentBounds(bounds);
  }, []);

  return (
    <main className="h-[calc(100vh-64px)] overflow-hidden bg-[#f8f6f1]">
      <ZonasFiltersBar
        filtros={filtros}
        setFiltros={setFiltros}
        total={terrenos.length}
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

      <section className="grid h-[calc(100%-108px)] grid-cols-1 lg:grid-cols-[420px_1fr]">
        <aside className="h-full overflow-y-auto border-r border-[#ddd6c7] bg-[#fcfbf8]">
          <div className="space-y-3 p-4">
            {loading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl border border-[#e8e2d7] bg-white"
                  />
                ))}
              </>
            )}

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
                    onSelect={handleCardClick}
                  />
                </div>
              ))}
          </div>
        </aside>

        <div className="h-full">
          <ZonasMap
            terrenos={terrenos}
            selectedId={selectedId}
            focusRequest={focusRequest}
            onSelectTerreno={handleMarkerClick}
            onBoundsChange={handleBoundsChange}
            userLocation={userLocation}
          />
        </div>
      </section>
    </main>
  );
}