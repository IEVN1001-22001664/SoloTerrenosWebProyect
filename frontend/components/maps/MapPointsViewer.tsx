/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPointsViewer({ terrenos }: any) {

  if (!terrenos || terrenos.length === 0) return null;

  return (
    <MapContainer
      center={terrenos[0].center}
      zoom={10}
      className="w-full h-[500px] rounded-xl"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {terrenos.map((t: any) => (
        <Marker key={t.id} position={t.center}>
          <Popup>
            <div>
              <h3 className="font-semibold">{t.titulo}</h3>
              <p>{t.tipo}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}