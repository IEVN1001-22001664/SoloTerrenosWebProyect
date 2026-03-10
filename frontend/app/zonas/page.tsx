/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ZonasPage() {
  const [terrenos, setTerrenos] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:5000/api/terrenos");
      const data = await res.json();
      setTerrenos(data);
    }

    load();
    console.log("ZonasPage cargada")
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

          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {terrenos.map((t) => (
            <Marker
              key={t.id}
              position={[t.centro_lat, t.centro_lng]}
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
                    {Math.round(t.area_m2)} m²
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