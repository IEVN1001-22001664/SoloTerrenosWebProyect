"use client";

import dynamic from "next/dynamic";
import { LatLngTuple } from 'leaflet';

// Cargamos el componente del mapa de forma dinámica
const TerrenoMap = dynamic(() => import("./TerrenoMap"), {
  ssr: false, // DESACTIVA el renderizado en el servidor para este componente
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-xl" /> // Opcional: un placeholder
});

interface Props {
  coordinates: LatLngTuple[];
}

export default function TerrenoMapWrapper({ coordinates }: Props) {
  return <TerrenoMap coordinates={coordinates} />;
}