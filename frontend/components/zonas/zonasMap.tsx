"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapBounds, TerrenoMapa } from "./types";

type FocusRequest = {
  id: number;
  source: "card" | "marker";
  nonce: number;
} | null;

interface Props {
  terrenos: TerrenoMapa[];
  selectedId: number | null;
  focusRequest: FocusRequest;
  onSelectTerreno: (id: number) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  userLocation: [number, number] | null;
}

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const MEXICO_ZOOM = 5;

function formatCompactPrice(value: number) {
  if (!value) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function createPriceIcon(price: number, selected = false): DivIcon {
  const bg = selected ? "#22341c" : "#828d4b";
  const border = selected ? "#9f885c" : "#22341c";

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

function InitialBoundsEmitter({
  onBoundsChange,
}: {
  onBoundsChange: (b: MapBounds) => void;
}) {
  const map = useMap();
  const didEmitRef = useRef(false);

  useEffect(() => {
    if (didEmitRef.current) return;

    const emit = () => {
      if (didEmitRef.current) return;
      didEmitRef.current = true;
      onBoundsChange(getBoundsFromMap(map));
    };

    const rafId = requestAnimationFrame(emit);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [map, onBoundsChange]);

  return null;
}

function MapEvents({
  onBoundsChange,
}: {
  onBoundsChange: (b: MapBounds) => void;
}) {
  useMapEvents({
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

    const target: L.LatLngExpression = [
      Number(terreno.centro_lat),
      Number(terreno.centro_lng),
    ];

    let targetZoom = map.getZoom();

    if (focusRequest.source === "card") {
      targetZoom = Math.max(targetZoom, 13);
    } else {
      targetZoom = Math.max(targetZoom, 12);
    }

    map.flyTo(target, targetZoom, {
      duration: 0.7,
    });

    lastNonceRef.current = focusRequest.nonce;
  }, [focusRequest, terrenos, map]);

  return null;
}

export default function ZonasMap({
  terrenos,
  selectedId,
  focusRequest,
  onSelectTerreno,
  onBoundsChange,
  userLocation,
}: Props) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={MEXICO_CENTER}
        zoom={MEXICO_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <InitialBoundsEmitter onBoundsChange={onBoundsChange} />
        <MapEvents onBoundsChange={onBoundsChange} />
        <FocusSelectedTerreno terrenos={terrenos} focusRequest={focusRequest} />

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

        {terrenos.map((t) => (
          <Marker
            key={t.id}
            position={[Number(t.centro_lat), Number(t.centro_lng)]}
            icon={createPriceIcon(t.precio, selectedId === t.id)}
            eventHandlers={{
              click: () => onSelectTerreno(t.id),
            }}
          >
            <Popup>
              <div className="w-[220px]">
                <h3 className="text-sm font-semibold text-[#22341c]">
                  {t.titulo}
                </h3>

                <p className="mt-1 text-xs text-[#817d58]">
                  {t.ubicacion || "Ubicación no disponible"}
                </p>

                <p className="mt-2 text-sm font-bold text-[#828d4b]">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 0,
                  }).format(t.precio || 0)}
                </p>

                {typeof t.area_m2 === "number" && (
                  <p className="mt-1 text-xs text-gray-600">
                    Área: {Math.round(t.area_m2)} m²
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}