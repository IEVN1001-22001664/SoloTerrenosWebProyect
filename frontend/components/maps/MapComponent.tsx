"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

/* ===================================== */
/* CALCULAR CENTRO                       */
/* ===================================== */
function getCenter(coords: number[][]) {
  let lat = 0;
  let lng = 0;

  coords.forEach(([y, x]) => {
    lat += y;
    lng += x;
  });

  return [lat / coords.length, lng / coords.length];
}

/* ===================================== */
/* CALCULAR PERÍMETRO                    */
/* ===================================== */
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

/* ===================================== */
/* CALCULAR ÁREA                         */
/* ===================================== */
function projectToMeters(coords: number[][]) {
  if (!Array.isArray(coords) || coords.length === 0) return [];

  const lat0 =
    coords.reduce((acc, [lat]) => acc + Number(lat), 0) / coords.length;

  const lng0 =
    coords.reduce((acc, [, lng]) => acc + Number(lng), 0) / coords.length;

  const latFactor = 110540;
  const lngFactor = 111320 * Math.cos((lat0 * Math.PI) / 180);

  return coords.map(([lat, lng]) => {
    const y = (Number(lat) - lat0) * latFactor;
    const x = (Number(lng) - lng0) * lngFactor;

    return [x, y];
  });
}

function getArea(coords: number[][]) {
  if (!Array.isArray(coords) || coords.length < 3) return 0;

  const points = projectToMeters(coords);
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
}

interface Props {
  onPolygonChange: (data: any) => void;
  centerCoordinates?: [number, number] | null;
  tipoMapa?: "esri" | "osm";
  initialPolygon?: number[][] | null;
}

interface DrawControlProps {
  onPolygonChange: (data: any) => void;
  setCoordinates: React.Dispatch<React.SetStateAction<number[][] | null>>;
  initialPolygon?: number[][] | null;
}

function FitPolygonBounds({ polygon }: { polygon: number[][] | null }) {
  const map = useMap();

  useEffect(() => {
    if (!polygon || polygon.length === 0) return;

    const bounds = L.latLngBounds(polygon as L.LatLngExpression[]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, polygon]);

  return null;
}

function UpdateMapCenter({
  centerCoordinates,
  hasPolygon,
}: {
  centerCoordinates?: [number, number] | null;
  hasPolygon: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (hasPolygon) return;
    if (!centerCoordinates) return;

    map.setView(centerCoordinates, 17, {
      animate: true,
      duration: 1.2,
    });
  }, [map, centerCoordinates, hasPolygon]);

  return null;
}

function DrawControl({
  onPolygonChange,
  setCoordinates,
  initialPolygon,
}: DrawControlProps) {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  /* ===================================== */
  /* EXTRAER Y CALCULAR DATOS DEL POLÍGONO */
  /* ===================================== */
  const procesarPoligono = (layer: any) => {
    if (!(layer instanceof L.Polygon)) return;

    const rawLatLngs = layer.getLatLngs() as any[];

    const firstLevel = Array.isArray(rawLatLngs[0])
      ? rawLatLngs[0]
      : rawLatLngs;

    const latlngs = firstLevel.map((latlng: any) => [
      latlng.lat,
      latlng.lng,
    ]);

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

    return latlngs;
  };

  /* ===================================== */
  /* CARGAR POLÍGONO INICIAL EN EL GRUPO   */
  /* ===================================== */
  useEffect(() => {
    if (!featureGroupRef.current) return;

    const featureGroup = featureGroupRef.current;

    featureGroup.clearLayers();

    if (initialPolygon && initialPolygon.length > 0) {
      const polygonLayer = L.polygon(
        initialPolygon as L.LatLngExpression[],
        {
          color: "#06489a",
          weight: 3,
        }
      );

      featureGroup.addLayer(polygonLayer);
      setCoordinates(initialPolygon);

      const bounds = L.latLngBounds(initialPolygon as L.LatLngExpression[]);
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
        duration: 1.2,
      });
    }
  }, [initialPolygon, map, setCoordinates]);

  /* ===================================== */
  /* CREAR POLÍGONO                        */
  /* ===================================== */
  const onCreated = (e: any) => {
    const featureGroup = featureGroupRef.current;

    if (featureGroup) {
      featureGroup.clearLayers();
      featureGroup.addLayer(e.layer);
    }

    const latlngs = procesarPoligono(e.layer);

    if (latlngs && latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs as L.LatLngExpression[]);
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
        duration: 5.2,
        easeLinearity: 0.25,
      });
    }
  };

  /* ===================================== */
  /* EDITAR POLÍGONO                       */
  /* ===================================== */
  const onEdited = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      procesarPoligono(layer);
    });
  };

  /* ===================================== */
  /* ELIMINAR POLÍGONO                     */
  /* ===================================== */
  const onDeleted = () => {
    setCoordinates(null);
    onPolygonChange(null);
  };

  return (
    <FeatureGroup
      ref={(ref) => {
        if (ref) {
          featureGroupRef.current = ref;
        }
      }}
    >
      <EditControl
        position="topright"
        onCreated={onCreated}
        onEdited={onEdited}
        onDeleted={onDeleted}
        draw={{
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
          polyline: false,
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#06489a",
              weight: 3,
            },
          },
        }}
      />
    </FeatureGroup>
  );
}

export default function MapComponent({
  onPolygonChange,
  centerCoordinates,
  tipoMapa = "esri",
  initialPolygon = null,
}: Props) {
  const [coordinates, setCoordinates] = useState<number[][] | null>(
    initialPolygon || null
  );

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`;
  const hasPolygon = Boolean(initialPolygon && initialPolygon.length > 0);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={centerCoordinates || [23.6345, -102.5528]}
        zoom={centerCoordinates ? 18 : 5}
        maxZoom={22}
        className="w-full h-full rounded-lg z-0"
      >
        <ResizeMap />
        <UpdateMapCenter
          centerCoordinates={centerCoordinates}
          hasPolygon={hasPolygon}
        />

        {/* CAPA BASE DEL MAPA */}
        {tipoMapa === "esri" ? (
          <TileLayer
            attribution="© Mapbox"
            url={mapboxUrl}
            tileSize={512}
            zoomOffset={-1}
            maxZoom={22}
          />
        ) : (
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}
          />
        )}

        {/* SI EXISTE POLÍGONO GUARDADO, AJUSTAR MAPA A SUS LÍMITES */}
        {initialPolygon && <FitPolygonBounds polygon={initialPolygon} />}

        {/* CAPA DE DIBUJO + POLÍGONO EDITABLE */}
        <DrawControl
          onPolygonChange={onPolygonChange}
          setCoordinates={setCoordinates}
          initialPolygon={initialPolygon}
        />
      </MapContainer>

      {/* DEBUG / COORDENADAS CAPTURADAS */}
      {coordinates && (
        <div className="mt-4 rounded-xl bg-gray-100 p-4">
          <h2 className="mb-2 font-semibold">
            Coordenadas capturadas:
          </h2>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(coordinates, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}