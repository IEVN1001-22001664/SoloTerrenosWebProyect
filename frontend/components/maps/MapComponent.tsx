/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

/* 🔥 Fuerza a Leaflet a recalcular tamaño */
function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

export default function MapComponent({ onPolygonChange }: any) {
  const [coordinates, setCoordinates] = useState<number[][] | null>(null);

  const onCreated = (e: any) => {
    const layer = e.layer;

    if (layer instanceof L.Polygon) {
        // Obtenemos los puntos y le decimos a TS que lo trate como un arreglo de LatLng
        const rawLatLngs = layer.getLatLngs() as any[]; 
        
        // Leaflet a veces devuelve arreglos anidados para polígonos, 
        // nos aseguramos de tomar el primer nivel que contiene los puntos.
        const firstLevel = Array.isArray(rawLatLngs[0]) ? rawLatLngs[0] : rawLatLngs;

        const latlngs = firstLevel.map((latlng: any) => [
          latlng.lat,
          latlng.lng,
        ]);

      setCoordinates(latlngs);
      onPolygonChange(latlngs);
    }
  };

  return (
    <div className="w-full">
      <MapContainer
        center={[19.4326, -99.1332]}
        zoom={13}
        className="w-full h-[500px] rounded-lg z-0"
      >
        <ResizeMap />

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={onCreated}
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              circlemarker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      {coordinates && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">
            Coordenadas capturadas:
          </h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(coordinates, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
