"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  polygon: [number, number][];
  center?: [number, number];
}

function FitBounds({ polygon }: { polygon: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (polygon && polygon.length > 0) {
      map.fitBounds(polygon);
    }
  }, [polygon, map]);

  return null;
}

export default function MapViewer({ polygon, center }: Props) {
  if (!polygon || polygon.length === 0) return null;

  return (
    <MapContainer
      className="w-full h-full rounded-lg"
      center={center || polygon[0]}
      zoom={15}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon positions={polygon} />

      <FitBounds polygon={polygon} />
    </MapContainer>
  );
}