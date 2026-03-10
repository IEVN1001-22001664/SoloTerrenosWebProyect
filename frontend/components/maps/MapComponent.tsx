/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

/* -------- CALCULAR CENTRO -------- */

function getCenter(coords: number[][]) {
  let lat = 0;
  let lng = 0;

  coords.forEach(([y, x]) => {
    lat += y;
    lng += x;
  });

  return [lat / coords.length, lng / coords.length];
}

/* -------- CALCULAR PERIMETRO -------- */

function getPerimeter(coords: number[][]) {
  let perimeter = 0;

  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];

    const distance = L.latLng(lat1, lng1).distanceTo(
      L.latLng(lat2, lng2)
    );

    perimeter += distance;
  }

  return perimeter;
}

/* -------- CALCULAR AREA -------- */

function getArea(coords: number[][]) {
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[(i + 1) % coords.length];

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2) * 111139 * 111139;
}

export default function MapComponent({ onPolygonChange }: any) {
  const [coordinates, setCoordinates] = useState<number[][] | null>(null);

  const onCreated = (e: any) => {
    const layer = e.layer;

    if (layer instanceof L.Polygon) {
      const rawLatLngs = layer.getLatLngs() as any[];

      const firstLevel = Array.isArray(rawLatLngs[0])
        ? rawLatLngs[0]
        : rawLatLngs;

      const latlngs = firstLevel.map((latlng: any) => [
        latlng.lat,
        latlng.lng,
      ]);

      /* CALCULOS */

      const center = getCenter(latlngs);
      const perimeter = getPerimeter(latlngs);
      const area = getArea(latlngs);

      const data = {
        polygon: latlngs,
        center,
        perimeter,
        area,
      };

      setCoordinates(latlngs);

      onPolygonChange(data);
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
          attribution="Tiles © Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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