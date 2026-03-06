"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FitBounds({ coordinates }: any) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      map.fitBounds(coordinates);
    }
  }, [coordinates, map]);

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapViewer({ coordinates }: any) {
  if (!coordinates || coordinates.length === 0) return null;

  return (
    <MapContainer
      className="w-full h-[500px] rounded-lg"
      center={coordinates[0]}
      zoom={15}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon positions={coordinates} />

      <FitBounds coordinates={coordinates} />
    </MapContainer>
  );
}
