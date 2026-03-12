"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../../maps/MapComponent"),
  { ssr: false }
);

interface Props {
  formData: any;
  setFormData: any;
}

export default function UbicacionMapa({ formData, setFormData }: Props) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-semibold text-[#22341c]">
        Ubicación del terreno
      </h2>

      {/* ESTADO */}
      <input
        type="text"
        placeholder="Estado"
        value={formData.estado_region}
        onChange={(e) =>
          setFormData({ ...formData, estado_region: e.target.value })
        }
        className="border p-3 rounded-lg w-full"
      />

      {/* MUNICIPIO */}
      <input
        type="text"
        placeholder="Municipio"
        value={formData.municipio}
        onChange={(e) =>
          setFormData({ ...formData, municipio: e.target.value })
        }
        className="border p-3 rounded-lg w-full"
      />

      {/* COLONIA */}
      <input
        type="text"
        placeholder="Colonia"
        value={formData.colonia}
        onChange={(e) =>
          setFormData({ ...formData, colonia: e.target.value })
        }
        className="border p-3 rounded-lg w-full"
      />

      {/* DIRECCION */}
      <input
        type="text"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={(e) =>
          setFormData({ ...formData, direccion: e.target.value })
        }
        className="border p-3 rounded-lg w-full"
      />

      {/* CODIGO POSTAL */}
      <input
        type="text"
        placeholder="Código Postal"
        value={formData.codigo_postal}
        onChange={(e) =>
          setFormData({ ...formData, codigo_postal: e.target.value })
        }
        className="border p-3 rounded-lg w-full"
      />

      {/* MAPA */}
      <div>
        <h3 className="font-semibold text-[#22341c] mb-2">
          Dibujar terreno en el mapa
        </h3>

        <div className="h-[450px] border border-[#817d58]/40 rounded-xl overflow-hidden shadow-sm">
          <MapComponent
            centerCoordinates={mapCenter}
            onPolygonChange={(data: any) =>
              setFormData({
                ...formData,
                poligono: data
              })
            }
          />
        </div>

        {formData.poligono && (
          <div className="grid grid-cols-3 gap-4 mt-6">

            {/* AREA */}
            <div className="bg-[#828d4b]/10 border border-[#828d4b]/40 p-4 rounded-xl text-center">
              <p className="text-sm text-[#817d58]">
                Área del terreno
              </p>
              <p className="text-2xl font-bold text-[#22341c]">
                {Math.round(formData.poligono.area)} m²
              </p>
            </div>

            {/* PERIMETRO */}
            <div className="bg-[#828d4b]/10 border border-[#828d4b]/40 p-4 rounded-xl text-center">
              <p className="text-sm text-[#817d58]">
                Perímetro
              </p>
              <p className="text-2xl font-bold text-[#22341c]">
                {Math.round(formData.poligono.perimeter)} m
              </p>
            </div>

            {/* CENTRO */}
            <div className="bg-[#828d4b]/10 border border-[#828d4b]/40 p-4 rounded-xl text-center">
              <p className="text-sm text-[#817d58]">
                Centro del terreno
              </p>
              <p className="text-xs text-[#22341c] break-all">
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