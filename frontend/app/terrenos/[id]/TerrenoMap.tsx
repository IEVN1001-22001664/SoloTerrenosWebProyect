"use client";

import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from 'leaflet';

// 1. Cambiamos el tipo de number[][] a LatLngTuple[]
interface Props {
  coordinates: LatLngTuple[];
}

// 2. Aplicamos el mismo tipo al componente interno
function FitBounds({ coordinates }: { coordinates: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      // Ahora fitBounds reconocerá que el arreglo tiene el formato correcto
      map.fitBounds(coordinates);
    }
  }, [coordinates, map]);

  return null;
}

export default function TerrenoMap({ coordinates }: Props) {
  // Verificación de seguridad
  if (!coordinates || coordinates.length === 0) return null;

  return (
    <MapContainer
      center={coordinates[0]} // center ahora recibe una tupla válida [lat, lng]
      zoom={15}
      className="w-full h-96 rounded-xl z-0"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Polygon también requiere LatLngTuple[] o LatLngExpression[] */}
      <Polygon positions={coordinates} />

      <FitBounds coordinates={coordinates} />
    </MapContainer>
  );
}