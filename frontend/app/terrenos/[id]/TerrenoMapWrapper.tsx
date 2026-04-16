"use client";

import dynamic from "next/dynamic";
import type { LatLngTuple } from "leaflet";

const TerrenoMap = dynamic(() => import("./TerrenoMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-[1.4rem] bg-[#ece8dd]" />
  ),
});

interface Props {
  coordinates: LatLngTuple[];
}

export default function TerrenoMapWrapper({ coordinates }: Props) {
  return (
    <div className="h-full w-full">
      <TerrenoMap coordinates={coordinates} />
    </div>
  );
}