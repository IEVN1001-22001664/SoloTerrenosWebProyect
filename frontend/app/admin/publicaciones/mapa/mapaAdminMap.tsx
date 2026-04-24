"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { Eye, Mail, MapPin, User } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface TerrenoAdminMapa {
  id: number;
  titulo: string;
  estado: string;
  precio?: number | string | null;
  ubicacion?: string | null;
  municipio?: string | null;
  estado_region?: string | null;
  centro_lat?: number | string | null;
  centro_lng?: number | string | null;
  usuario?: string | null;
  usuario_email?: string | null;
}

interface Props {
  terrenos: TerrenoAdminMapa[];
  selectedId: number | null;
  onSelectTerreno: (id: number) => void;
}

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const MEXICO_ZOOM = 6;

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined) return "$0";
  return `$${Number(value).toLocaleString("es-MX")}`;
}

function estadoColor(estado?: string) {
  const value = estado?.toLowerCase();

  if (value === "aprobado") return "#16a34a";
  if (value === "pendiente") return "#d97706";
  if (value === "rechazado") return "#dc2626";
  if (value === "pausado") return "#64748b";

  return "#22341c";
}

function createAdminIcon(precio: number, estado: string, selected: boolean) {
  const color = selected ? "#22341c" : estadoColor(estado);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        color:white;
        border:2px solid white;
        border-radius:999px;
        padding:7px 11px;
        font-size:12px;
        font-weight:800;
        box-shadow:0 8px 22px rgba(15,23,42,0.24);
        white-space:nowrap;
        transform:${selected ? "scale(1.08)" : "scale(1)"};
      ">
        ${formatMoney(precio)}
      </div>
    `,
    iconSize: [90, 34],
    iconAnchor: [45, 17],
  });
}

function FocusSelected({
  terrenos,
  selectedId,
}: {
  terrenos: TerrenoAdminMapa[];
  selectedId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;

    const terreno = terrenos.find((t) => t.id === selectedId);
    if (!terreno) return;

    const lat = Number(terreno.centro_lat);
    const lng = Number(terreno.centro_lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    requestAnimationFrame(() => {
      map.invalidateSize();

      map.flyTo([lat, lng], Math.max(map.getZoom(), 13), {
        duration: 0.7,
      });
    });
  }, [selectedId, terrenos, map]);

  return null;
}

export default function MapaAdminMap({
  terrenos,
  selectedId,
  onSelectTerreno,
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

        <FocusSelected terrenos={terrenos} selectedId={selectedId} />

        {terrenos.map((t) => {
          const lat = Number(t.centro_lat);
          const lng = Number(t.centro_lng);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const selected = selectedId === t.id;

          return (
            <Marker
              key={t.id}
              position={[lat, lng]}
              icon={createAdminIcon(Number(t.precio || 0), t.estado, selected)}
              eventHandlers={{
                click: () => onSelectTerreno(t.id),
              }}
            >
              <Popup closeButton={false}>
                <div className="w-[300px] rounded-2xl bg-white p-4">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: estadoColor(t.estado) }}
                  >
                    {t.estado}
                  </span>

                  <h3 className="mt-3 text-base font-bold text-[#22341c]">
                    {t.titulo}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {t.municipio || t.ubicacion || "Sin ubicación"}
                  </p>

                  <p className="mt-3 text-xl font-bold text-[#828d4b]">
                    {formatMoney(t.precio)}
                  </p>

                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.usuario || "Colaborador no disponible"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.usuario_email || "Correo no disponible"}
                    </p>
                  </div>

                  <Link
                    href={`/admin/publicaciones/${t.id}`}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#22341c] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[#828d4b]"
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalle
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}