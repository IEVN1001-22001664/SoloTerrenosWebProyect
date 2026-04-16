"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Crosshair,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Satellite,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Props {
  coordinates: [number, number][];
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function FitPolygonBounds({
  coordinates,
}: {
  coordinates: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    const bounds = L.latLngBounds(coordinates as L.LatLngExpression[]);
    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: 19,
      animate: true,
    });
  }, [map, coordinates]);

  return null;
}

function PolygonCenterMarker({
  coordinates,
}: {
  coordinates: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    const bounds = L.latLngBounds(coordinates as L.LatLngExpression[]);
    if (!bounds.isValid()) return;

    const center = bounds.getCenter();

    const marker = L.marker(center, {
      icon: L.divIcon({
        className: "",
        html: `
          <div style="
            width:16px;
            height:16px;
            background:#22341c;
            border:3px solid white;
            border-radius:999px;
            box-shadow:0 4px 12px rgba(0,0,0,.28);
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [map, coordinates]);

  return null;
}

function TerrenoMapCanvas({
  coordinates,
  tipoMapa,
  mapRef,
}: {
  coordinates: [number, number][];
  tipoMapa: "satelite" | "mapa";
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const polygonPositions = useMemo(() => {
    if (!Array.isArray(coordinates)) return [];
    return coordinates.filter(
      (point) =>
        Array.isArray(point) &&
        point.length >= 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number"
    );
  }, [coordinates]);

  const centerFallback: [number, number] =
    polygonPositions.length > 0
      ? polygonPositions[0]
      : [23.6345, -102.5528];

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`;
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileUrl = tipoMapa === "satelite" ? mapboxUrl : osmUrl;
  const attribution =
    tipoMapa === "satelite"
      ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      : "&copy; OpenStreetMap contributors";

  const tileSize = tipoMapa === "satelite" ? 512 : 256;
  const zoomOffset = tipoMapa === "satelite" ? -1 : 0;

  return (
    <MapContainer
      center={centerFallback}
      zoom={17}
      scrollWheelZoom
      maxZoom={22}
      className="h-full w-full"
      zoomControl={true}
      ref={(instance) => {
        if (instance) {
          mapRef.current = instance;
        }
      }}
    >
      <ResizeMap />
      <FitPolygonBounds coordinates={polygonPositions} />
      <PolygonCenterMarker coordinates={polygonPositions} />

      <TileLayer
        key={tipoMapa}
        url={tileUrl}
        attribution={attribution}
        maxZoom={22}
        tileSize={tileSize}
        zoomOffset={zoomOffset}
      />

      {polygonPositions.length > 0 && (
        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: "#2f80ed",
            weight: 4,
            fillColor: "#2f80ed",
            fillOpacity: 0.18,
          }}
        />
      )}
    </MapContainer>
  );
}

export default function TerrenoMap({ coordinates }: Props) {
  const [tipoMapa, setTipoMapa] = useState<"satelite" | "mapa">("satelite");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!fullscreenOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenOpen]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (!coordinates || coordinates.length === 0) return;

    const bounds = L.latLngBounds(coordinates as L.LatLngExpression[]);
    if (!bounds.isValid()) return;

    mapRef.current.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: 19,
      animate: true,
    });
  };

  const Controls = ({
    isFullscreen = false,
  }: {
    isFullscreen?: boolean;
  }) => (
    <>
      {/* MOBILE */}
      <div className="pointer-events-none absolute right-0 top-0 z-[500] p-3 md:hidden">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setFullscreenOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#22341c]/92 text-white shadow-lg backdrop-blur-sm"
            aria-label={isFullscreen ? "Cerrar mapa" : "Expandir mapa"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setTipoMapa("satelite")}
            className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition ${
              tipoMapa === "satelite"
                ? "bg-[#22341c] text-white"
                : "bg-white/92 text-[#22341c]"
            }`}
            aria-label="Vista satélite"
          >
            <Satellite size={18} />
          </button>

          <button
            type="button"
            onClick={() => setTipoMapa("mapa")}
            className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition ${
              tipoMapa === "mapa"
                ? "bg-[#22341c] text-white"
                : "bg-white/92 text-[#22341c]"
            }`}
            aria-label="Vista mapa"
          >
            <MapIcon size={18} />
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[#22341c] shadow-lg backdrop-blur-sm transition hover:bg-white"
            aria-label="Centrar polígono"
            title="Centrar polígono"
          >
            <Crosshair size={18} className="text-[#828d4b]" />
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="pointer-events-none absolute right-0 top-0 z-[500] hidden p-4 md:block">
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={() => setFullscreenOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#22341c]/92 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-[#22341c]"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? "Cerrar mapa" : "Expandir mapa"}
          </button>

          <div className="rounded-2xl bg-white/92 px-4 py-3 shadow-lg backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#817d58]">
              Vista
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoMapa("satelite")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  tipoMapa === "satelite"
                    ? "bg-[#22341c] text-white"
                    : "bg-[#f3f0e8] text-[#22341c] hover:bg-[#e9e3d5]"
                }`}
              >
                <Satellite size={16} />
                Satélite
              </button>

              <button
                type="button"
                onClick={() => setTipoMapa("mapa")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  tipoMapa === "mapa"
                    ? "bg-[#22341c] text-white"
                    : "bg-[#f3f0e8] text-[#22341c] hover:bg-[#e9e3d5]"
                }`}
              >
                <MapIcon size={16} />
                Mapa
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/92 px-4 py-3 text-sm font-semibold text-[#22341c] shadow-lg backdrop-blur-sm transition hover:bg-white"
          >
            <Crosshair size={16} className="text-[#828d4b]" />
            Centrar polígono
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="relative h-full w-full overflow-hidden rounded-[1.4rem]">
        <TerrenoMapCanvas
          coordinates={coordinates}
          tipoMapa={tipoMapa}
          mapRef={mapRef}
        />
        <Controls />
      </div>

      {fullscreenOpen && (
        <div className="fixed inset-0 z-[999] bg-black/82 backdrop-blur-sm">
          <div className="absolute right-4 top-4 z-[1001]">
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20"
              aria-label="Cerrar mapa"
            >
              <X size={22} />
            </button>
          </div>

          <div className="h-full w-full p-3 md:p-6 xl:p-8">
            <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#e9e4d8] shadow-2xl md:rounded-[2rem]">
              <TerrenoMapCanvas
                coordinates={coordinates}
                tipoMapa={tipoMapa}
                mapRef={mapRef}
              />
              <Controls isFullscreen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}