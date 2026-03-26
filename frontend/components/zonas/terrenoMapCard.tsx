"use client";

import { MapPin, LandPlot } from "lucide-react";
import { TerrenoMapa } from "./types";

interface Props {
  terreno: TerrenoMapa;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function TerrenoMapCard({
  terreno,
  isSelected,
  onSelect,
}: Props) {
  return (
    <article
      onClick={() => onSelect(terreno.id)}
      className={`cursor-pointer rounded-2xl border bg-white p-3 shadow-sm transition ${
        isSelected
          ? "border-[#828d4b] ring-2 ring-[#828d4b]/20"
          : "border-[#e6e0d3] hover:border-[#9f885c] hover:shadow-md"
      }`}
    >
      <div className="flex gap-3">
        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#f1eee7]">
          {terreno.imagen_principal ? (
            <img
              src={terreno.imagen_principal}
              alt={terreno.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#817d58]">
              Sin imagen
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-[#22341c]">
            {formatPrice(terreno.precio)}
          </p>

          <h2 className="line-clamp-1 text-sm font-semibold text-[#22341c]">
            {terreno.titulo}
          </h2>

          <div className="mt-1 flex items-center gap-1 text-xs text-[#817d58]">
            <MapPin size={13} />
            <span className="line-clamp-1">
              {terreno.ubicacion || "Ubicación no disponible"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {terreno.tipo && (
              <span className="rounded-full bg-[#f1eee7] px-2 py-1 text-[#22341c]">
                {terreno.tipo}
              </span>
            )}

            {typeof terreno.area_m2 === "number" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#edf1e5] px-2 py-1 text-[#22341c]">
                <LandPlot size={12} />
                {Math.round(terreno.area_m2)} m²
              </span>
            )}

            {terreno.estado_region && (
              <span className="rounded-full bg-[#f7f4ec] px-2 py-1 text-[#817d58]">
                {terreno.estado_region}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}