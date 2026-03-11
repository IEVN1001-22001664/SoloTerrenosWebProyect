"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function ZonasPage() {
  const [terrenos, setTerrenos] = useState<any[]>([]);

  useEffect(() => {
    console.log("ZonasPage cargada")
    console.log("Intentando cargar terrenos ...");
    async function load() {
      console.log("Enviando request al backend");
      const res = await fetch("http://localhost:5000/api/terrenos/publicos");
      console.log("Respuesta HTTP", res.status);
      const data = await res.json();
      console.log("Datos recibidos", data);
      console.log("Primer terreno:", data[0]);
      setTerrenos(data);
    }

    load();
  }, []);

  return (
    <main className="h-screen flex">

      {/* LISTADO */}

      <div className="w-[35%] overflow-y-scroll bg-white border-r">

        <div className="p-6">

          <h1 className="text-2xl font-bold text-[#22341c] mb-6">
            Terrenos disponibles
          </h1>

          <div className="space-y-6">

            {terrenos.map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h2 className="font-semibold text-lg text-[#22341c]">
                  {t.titulo}
                </h2>

                <p className="text-sm text-gray-500">
                  {t.ubicacion}
                </p>

                <p className="text-[#828d4b] font-semibold mt-2">
                  ${t.precio}
                </p>

                <p className="text-sm text-gray-600">
                  Área: {Math.round(t.area_m2)} m²
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>

      {/* MAPA */}

      <div className="flex-1">

        <MapContainer
          center={[23.6, -102.5]}
          zoom={5}
          className="h-full w-full"
        >

          <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {terrenos
          .filter((t) => t.center_lat && t.center_lng)
          .map((t) => (
            <Marker
              key={t.id}
              position={[Number(t.centro_lat), Number(t.centro_lng)]}
            >
              <Popup>

                <div className="w-[200px]">

                  <h3 className="font-semibold text-[#22341c]">
                    {t.titulo}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {t.ubicacion}
                  </p>

                  <p className="text-[#828d4b] font-bold mt-2">
                    ${t.precio}
                  </p>

                  <p className="text-xs text-gray-600">
                    {Math.round(t.area)} m²
                  </p>

                </div>

              </Popup>
            </Marker>
          ))}

        </MapContainer>

      </div>

    </main>
  );
}