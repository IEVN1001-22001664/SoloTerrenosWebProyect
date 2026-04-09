"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Marker as LeafletMarker, LatLngExpression } from "leaflet";
import L, { DivIcon } from "leaflet";
import { Map as MapIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { MapBounds, PolygonPoint, TerrenoMapa } from "./types";

type FocusRequest = {
  id: number;
  source: "card" | "marker";
  nonce: number;
} | null;

interface Props {
  terrenos: TerrenoMapa[];
  selectedId: number | null;
  hoveredId: number | null;
  openPopupId: number | null;
  focusRequest: FocusRequest;
  onSelectTerreno: (id: number) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  onClosePopup: () => void;
  userLocation: [number, number] | null;
  initialCenter?: [number, number] | null;
  initialZoom?: number | null;
  initialBounds?: MapBounds | null;
}

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const MEXICO_ZOOM = 6;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAPBOX_SATELLITE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
  : "";

function formatCompactPrice(value: number) {
  if (!value) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function createPriceIcon(
  price: number,
  state: "default" | "hovered" | "selected" = "default"
): DivIcon {
  const bg =
    state === "selected"
      ? "#22341c"
      : state === "hovered"
      ? "#426C8E"
      : "#828d4b";

  const border =
    state === "selected"
      ? "#9f885c"
      : state === "hovered"
      ? "#22341c"
      : "#22341c";

  const scale = state === "selected" ? 1.08 : state === "hovered" ? 1.04 : 1;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${bg};
        color:white;
        border:2px solid ${border};
        border-radius:999px;
        padding:7px 10px;
        font-size:12px;
        font-weight:700;
        box-shadow:0 6px 18px rgba(0,0,0,0.18);
        white-space:nowrap;
        line-height:1;
        transform:scale(${scale});
        transition:transform .15s ease;
      ">
        ${formatCompactPrice(price)}
      </div>
    `,
    iconSize: [72, 32],
    iconAnchor: [36, 16],
  });
}

function getBoundsFromMap(map: L.Map): MapBounds {
  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function normalizePolygonPositions(
  poligono: TerrenoMapa["poligono"]
): LatLngExpression[] {
  if (!poligono) return [];
  if (!Array.isArray(poligono)) return [];

  // [[lat, lng], ...] o [[lng, lat], ...]
  if (
    poligono.length > 0 &&
    Array.isArray(poligono[0]) &&
    (poligono[0] as any[]).length >= 2 &&
    typeof (poligono[0] as any[])[0] === "number"
  ) {
    const firstPoint = poligono[0] as number[];
    const looksLikeGeoJson =
      Math.abs(firstPoint[0]) > 90 || Math.abs(firstPoint[1]) <= 90;

    return (poligono as number[][]).map((point) => {
      if (looksLikeGeoJson) {
        return [point[1], point[0]] as LatLngExpression;
      }
      return [point[0], point[1]] as LatLngExpression;
    });
  }

  // [{lat, lng}, ...]
  if (
    poligono.length > 0 &&
    typeof poligono[0] === "object" &&
    poligono[0] !== null &&
    "lat" in (poligono[0] as Record<string, unknown>) &&
    "lng" in (poligono[0] as Record<string, unknown>)
  ) {
    return (poligono as PolygonPoint[]).map((point) => {
      if (Array.isArray(point)) {
        return [point[0], point[1]] as LatLngExpression;
      }
      return [point.lat, point.lng] as LatLngExpression;
    });
  }

  // GeoJSON Polygon [[[lng, lat], ...]]
  if (
    poligono.length > 0 &&
    Array.isArray(poligono[0]) &&
    Array.isArray((poligono[0] as any[])[0])
  ) {
    const ring = (poligono[0] as number[][]) || [];
    return ring.map((point) => [point[1], point[0]] as LatLngExpression);
  }

  return [];
}

function InitialBoundsEmitter({
  onBoundsChange,
}: {
  onBoundsChange: (b: MapBounds) => void;
}) {
  const map = useMap();
  const didEmitRef = useRef(false);

  useEffect(() => {
    if (didEmitRef.current) return;

    const rafId = requestAnimationFrame(() => {
      if (didEmitRef.current) return;
      didEmitRef.current = true;
      onBoundsChange(getBoundsFromMap(map));
    });

    return () => cancelAnimationFrame(rafId);
  }, [map, onBoundsChange]);

  return null;
}

function DynamicBaseLayer({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  useMapEvents({
    zoom(e) {
      onZoomChange(e.target.getZoom());
    },
    zoomend(e) {
      onZoomChange(e.target.getZoom());
    },
  });

  return null;
}

function MapEvents({
  onBoundsChange,
  onClosePopup,
  onDismissPolygon,
}: {
  onBoundsChange: (b: MapBounds) => void;
  onClosePopup: () => void;
  onDismissPolygon: () => void;
}) {
  useMapEvents({
    click() {
      onDismissPolygon();
      onClosePopup();
    },
    moveend(e) {
      onBoundsChange(getBoundsFromMap(e.target));
    },
    zoomend(e) {
      onBoundsChange(getBoundsFromMap(e.target));
    },
  });

  return null;
}

function FocusSelectedTerreno({
  terrenos,
  focusRequest,
}: {
  terrenos: TerrenoMapa[];
  focusRequest: FocusRequest;
}) {
  const map = useMap();
  const lastNonceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!focusRequest) return;
    if (lastNonceRef.current === focusRequest.nonce) return;

    const terreno = terrenos.find((t) => t.id === focusRequest.id);
    if (!terreno) return;

    const target: LatLngExpression = [
      Number(terreno.centro_lat),
      Number(terreno.centro_lng),
    ];

    const targetZoom =
      focusRequest.source === "card"
        ? Math.max(map.getZoom(), 13)
        : Math.max(map.getZoom(), 12);

    map.flyTo(target, targetZoom, {
      duration: 0.7,
    });

    lastNonceRef.current = focusRequest.nonce;
  }, [focusRequest, terrenos, map]);

  return null;
}

function ActivePolygonOverlay({
  terrenos,
  activePolygonId,
}: {
  terrenos: TerrenoMapa[];
  activePolygonId: number | null;
}) {
  const map = useMap();
  const lastFitIdRef = useRef<number | null>(null);

  const activeTerreno = terrenos.find((t) => t.id === activePolygonId) || null;
  const positions = normalizePolygonPositions(activeTerreno?.poligono);

  useEffect(() => {
    if (!activePolygonId || !positions.length) return;
    if (lastFitIdRef.current === activePolygonId) return;

    const bounds = L.latLngBounds(positions as L.LatLngExpression[]);
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: Math.max(map.getZoom(), 19),
      });
    }

    lastFitIdRef.current = activePolygonId;
  }, [activePolygonId, positions, map]);

  if (!activePolygonId || !positions.length) return null;

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: "#38BDF8",
        weight: 4,
        fillColor: "#38BDF8",
        fillOpacity: 0.22,
      }}
    />
  );
}


function InitialRegionFit({
  initialBounds,
}: {
  initialBounds?: MapBounds | null;
}) {
  const map = useMap();
  const didApplyRef = useRef(false);

  useEffect(() => {
    if (!initialBounds) return;
    if (didApplyRef.current) return;

    const bounds = L.latLngBounds(
      [initialBounds.south, initialBounds.west],
      [initialBounds.north, initialBounds.east]
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 12,
      });
      didApplyRef.current = true;
    }
  }, [initialBounds, map]);

  return null;
}


export default function ZonasMap({
  terrenos,
  selectedId,
  hoveredId,
  openPopupId,
  focusRequest,
  onSelectTerreno,
  onBoundsChange,
  onClosePopup,
  userLocation,
  initialCenter = null,
  initialZoom = null,
  initialBounds = null,
}: Props) {

  const markerRefs = useRef<Record<number, LeafletMarker | null>>({});
  const [currentZoom, setCurrentZoom] = useState<number>(MEXICO_ZOOM);
  const [activePolygonId, setActivePolygonId] = useState<number | null>(null);
  const visiblePolygonId = useMemo(() => {
  if (focusRequest) return null;
  if (openPopupId !== null) return null;
  return activePolygonId;
}, [activePolygonId, focusRequest, openPopupId]);

  const isSatellite = Boolean(MAPBOX_TOKEN) && currentZoom >= 18;
  const effectiveInitialCenter = initialCenter ?? MEXICO_CENTER;
  const effectiveInitialZoom = initialZoom ?? MEXICO_ZOOM;

  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      if (!marker) return;

      if (Number(id) === openPopupId) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });
  }, [openPopupId, terrenos]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={effectiveInitialCenter}
        zoom={effectiveInitialZoom}
        scrollWheelZoom
        maxZoom={22}
        className="h-full w-full"
      >
        <TileLayer
          key={isSatellite ? "satellite" : "osm"}
          attribution={
            isSatellite
              ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              : "&copy; OpenStreetMap contributors"
          }
          url={isSatellite ? MAPBOX_SATELLITE_URL : OSM_URL}
          maxZoom={isSatellite ? 22 : 19}
        />

        <DynamicBaseLayer onZoomChange={setCurrentZoom} />
        <InitialBoundsEmitter onBoundsChange={onBoundsChange} />
        <InitialRegionFit initialBounds={initialBounds} />
        <MapEvents
          onBoundsChange={onBoundsChange}
          onClosePopup={onClosePopup}
          onDismissPolygon={() => setActivePolygonId(null)}
        />
        <FocusSelectedTerreno terrenos={terrenos} focusRequest={focusRequest} />
        <ActivePolygonOverlay
          terrenos={terrenos}
          activePolygonId={visiblePolygonId}
        />

        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "",
              html: `
                <div style="
                  width:18px;
                  height:18px;
                  border-radius:999px;
                  background:#22341c;
                  border:3px solid white;
                  box-shadow:0 0 0 8px rgba(34,52,28,0.18);
                "></div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>Tu ubicación aproximada</Popup>
          </Marker>
        )}

        {terrenos.map((t) => {
          const state =
            selectedId === t.id
              ? "selected"
              : hoveredId === t.id
              ? "hovered"
              : "default";

          const areaValue =
            t.area_m2 !== null &&
            t.area_m2 !== undefined &&
            !Number.isNaN(Number(t.area_m2))
              ? `${Math.round(Number(t.area_m2))} m²`
              : "No disponible";

          const tipoValue = t.uso_suelo || t.tipo || "No disponible";

          return (
            <Marker
              key={t.id}
              position={[Number(t.centro_lat), Number(t.centro_lng)]}
              icon={createPriceIcon(t.precio, state)}
              eventHandlers={{
                click: () => {
                  setActivePolygonId(null);
                  onSelectTerreno(t.id);
                },
              }}
              ref={(ref) => {
                markerRefs.current[t.id] = ref ?? null;
              }}
            >
              <Popup className="custom-terreno-popup" closeButton={false}>
                <div className="w-[340px] overflow-hidden rounded-[26px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                  <div className="px-3 pt-3">
                    <div className="relative h-[155px] w-full overflow-hidden rounded-[22px] bg-[#f1eee7]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePolygonId(t.id);
                          onClosePopup();
                        }}
                        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#22341c] shadow-md transition hover:bg-white"
                        title="Ver polígono del terreno"
                      >
                        <MapIcon size={16} />
                      </button>

                      {t.imagen_principal ? (
                        <img
                          src={t.imagen_principal}
                          alt={t.titulo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#817d58]">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3">
                    <h3 className="text-[15px] font-bold leading-tight text-[#22341c]">
                      {t.titulo}
                    </h3>

                    <p className="mt-2 text-[11px] font-medium leading-snug text-[#817d58]">
                      {t.ubicacion || "Ubicación no disponible"}
                    </p>

                    <p className="mt-3 text-[18px] font-extrabold leading-none text-[#828d4b]">
                      {formatPrice(t.precio)}
                    </p>

                    <div className="mt-4 grid grid-cols-[1fr_1fr_112px] overflow-hidden rounded-[16px]">
                      <div className="flex items-center justify-center bg-[#828d4b] px-2 py-3 text-center text-[12px] font-semibold leading-none text-white">
                        {areaValue}
                      </div>

                      <div className="flex items-center justify-center border-l border-white/10 bg-[#828d4b] px-2 py-3 text-center text-[12px] font-semibold leading-none text-white">
                        {tipoValue}
                      </div>

                      <Link
                        href={`/terrenos/${t.id}`}
                        className="flex items-center justify-center bg-[#9f885c] px-3 py-3 text-center text-[13px] font-semibold leading-none no-underline transition hover:brightness-95"
                        style={{ color: "#ffffff", textDecoration: "none" }}
                      >
                        <span style={{ color: "#ffffff" }}>Ver más</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}