"use client";

import dynamic from "next/dynamic";

const TerrenoMap = dynamic(() => import("./TerrenoMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-[1.4rem] bg-[#ece8dd]" />
  ),
});

interface Props {
  coordinates: [number, number][];
}

export default function TerrenoMapWrapper({ coordinates }: Props) {
  return (
    <div className="h-full w-full">
      <TerrenoMap coordinates={coordinates} />
    </div>
  );
}