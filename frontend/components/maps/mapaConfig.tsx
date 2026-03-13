/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("./MapComponent"),
  { ssr: false }
);

interface Props {
  mapCenter: [number, number];
  formData: any;
  setFormData: any;
}

export default function MapaConfig({
  mapCenter,
  formData,
  setFormData,
}: Props) {
  const tipoMapa = formData.tipoMapa || "osm";
  const [errorCoordenadas, setErrorCoordenadas] = useState("");

  const buscarPorCoordenadas = () => {
    const lat = formData.latitud_manual?.trim();
    const lng = formData.longitud_manual?.trim();

    if (!lat || !lng) {
      setErrorCoordenadas("Debes escribir latitud y longitud.");
      return;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setErrorCoordenadas("Las coordenadas deben ser números válidos.");
      return;
    }

    if (latNum < -90 || latNum > 90) {
      setErrorCoordenadas("La latitud debe estar entre -90 y 90.");
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      setErrorCoordenadas("La longitud debe estar entre -180 y 180.");
      return;
    }

    setErrorCoordenadas("");

    setFormData({
      ...formData,
      mapCenter: [latNum, lngNum],
    });
  };

  return (
    <div className="animate-[slideFadeIn_.45s_ease-out]">
      <style jsx>{`
        @keyframes slideFadeIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="rounded-2xl border border-[#817d58]/20 bg-white p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4">
          {/* MAPA IZQUIERDA */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-[#22341c]">
                Dibujar terreno en el mapa
              </h3>
              <p className="text-sm text-[#817d58]">
                Usa la vista más conveniente para ubicar y delimitar el terreno.
              </p>
            </div>

            <div className="h-[420px] md:h-[500px] overflow-hidden rounded-2xl border border-[#817d58]/30 shadow-sm">
              <MapComponent
                centerCoordinates={mapCenter}
                tipoMapa={tipoMapa}
                initialPolygon={formData.poligono?.polygon || null}
                onPolygonChange={(data: any) =>
                  setFormData({
                    ...formData,
                    poligono: data,
                  })
                }
              />
            </div>
          </div>

          {/* PANEL DERECHO */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-[#817d58]/20 bg-[#fafaf7] p-4">
            <div>
              <h4 className="font-semibold text-[#22341c]">
                Controles del mapa
              </h4>
              <p className="mt-1 text-sm text-[#817d58]">
                Cambia entre vista satelital y vista de calles según necesites.
              </p>
            </div>

            {/* TIPO DE VISTA */}
            <div className="rounded-xl border border-[#817d58]/20 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-[#22341c]">
                Tipo de vista
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tipoMapa: "esri",
                    })
                  }
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    tipoMapa === "esri"
                      ? "bg-[#22341c] text-white"
                      : "border border-[#817d58]/30 bg-white text-[#22341c] hover:bg-[#828d4b]/10"
                  }`}
                >
                  Satélite
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tipoMapa: "osm",
                    })
                  }
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    tipoMapa === "osm"
                      ? "bg-[#22341c] text-white"
                      : "border border-[#817d58]/30 bg-white text-[#22341c] hover:bg-[#828d4b]/10"
                  }`}
                >
                  Mapa
                </button>
              </div>
            </div>

            {/* BÚSQUEDA POR COORDENADAS */}
            <div className="rounded-xl border border-[#817d58]/20 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-[#22341c]">
                Búsqueda por coordenadas
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Latitud"
                  value={formData.latitud_manual || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitud_manual: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[#817d58]/30 p-3 text-sm outline-none focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
                />

                <input
                  type="text"
                  placeholder="Longitud"
                  value={formData.longitud_manual || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitud_manual: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[#817d58]/30 p-3 text-sm outline-none focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
                />

                <button
                  type="button"
                  onClick={buscarPorCoordenadas}
                  className="w-full rounded-lg bg-[#828d4b] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#22341c]"
                >
                  Buscar
                </button>

                {errorCoordenadas && (
                  <p className="text-sm text-red-600">
                    {errorCoordenadas}
                  </p>
                )}
              </div>
            </div>

            {/* AYUDA */}
            <div className="rounded-xl border border-[#817d58]/20 bg-white p-4">
              <p className="mb-2 text-sm font-medium text-[#22341c]">
                Ayuda
              </p>
              <p className="text-sm text-[#817d58]">
                Próximamente aquí podrás abrir una guía rápida para dibujar el
                terreno correctamente.
              </p>
            </div>
          </aside>
        </div>

        {/* MÉTRICAS ABAJO */}
        {formData.poligono && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#828d4b]/30 bg-[#828d4b]/10 p-4 text-center">
              <p className="mb-1 text-sm text-[#817d58]">
                Área del terreno
              </p>
              <p className="text-2xl font-bold text-[#22341c]">
                {Math.round(formData.poligono.area)} m²
              </p>
            </div>

            <div className="rounded-2xl border border-[#828d4b]/30 bg-[#828d4b]/10 p-4 text-center">
              <p className="mb-1 text-sm text-[#817d58]">
                Perímetro
              </p>
              <p className="text-2xl font-bold text-[#22341c]">
                {Math.round(formData.poligono.perimeter)} m
              </p>
            </div>

            <div className="rounded-2xl border border-[#828d4b]/30 bg-[#828d4b]/10 p-4 text-center">
              <p className="mb-1 text-sm text-[#817d58]">
                Centro del terreno
              </p>
              <p className="break-words text-base font-semibold leading-snug text-[#22341c] md:text-lg">
                {formData.poligono.center[0].toFixed(6)},{" "}
                {formData.poligono.center[1].toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}