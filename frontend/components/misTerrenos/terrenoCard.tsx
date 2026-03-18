"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EstadoTerrenoBadge from "./estadoTerrenoBadge";

interface Props {
  terreno: any;
}

export default function TerrenoCard({ terreno }: Props) {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);

  const imagen = terreno.imagen_principal
    ? `http://localhost:5000${terreno.imagen_principal}`
    : "https://via.placeholder.com/600x400?text=Sin+imagen";

  const estado = (terreno.estado || "").toLowerCase();

  const pausarTerreno = async () => {
    const confirmar = window.confirm(
      "¿Deseas pausar este terreno?\n\nMientras esté pausado no será visible públicamente."
    );

    if (!confirmar) return;

    try {
      setProcesando(true);

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}/pausar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "No se pudo pausar el terreno.");
        setProcesando(false);
        return;
      }

      alert("Terreno pausado correctamente.");
      router.refresh();
    } catch (error) {
      console.error("Error pausando terreno:", error);
      alert("Error de conexión al pausar el terreno.");
      setProcesando(false);
    }
  };

  const reactivarTerreno = async () => {
    const confirmar = window.confirm(
      "¿Deseas reactivar este terreno?\n\nVolverá a estar visible públicamente."
    );

    if (!confirmar) return;

    try {
      setProcesando(true);

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}/reactivar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "No se pudo reactivar el terreno.");
        setProcesando(false);
        return;
      }

      alert("Terreno reactivado correctamente.");
      router.refresh();
    } catch (error) {
      console.error("Error reactivando terreno:", error);
      alert("Error de conexión al reactivar el terreno.");
      setProcesando(false);
    }
  };

  const eliminarTerreno = async () => {
    const confirmar = window.confirm(
      "¿Eliminar este terreno definitivamente?\n\nEsta acción eliminará el terreno, sus imágenes y sus documentos de forma permanente.\n\nNo podrás recuperarlo después."
    );

    if (!confirmar) return;

    try {
      setProcesando(true);

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "No se pudo eliminar el terreno.");
        setProcesando(false);
        return;
      }

      alert("Terreno eliminado definitivamente.");
      router.refresh();
    } catch (error) {
      console.error("Error eliminando terreno:", error);
      alert("Error de conexión al eliminar el terreno.");
      setProcesando(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#817d58]/20 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* IMAGEN */}
      <div className="relative">
        <img
          src={imagen}
          alt={terreno.titulo}
          className="h-52 w-full object-cover"
        />

        <div className="absolute left-3 top-3">
          <EstadoTerrenoBadge estado={terreno.estado || "Pendiente"} />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-[#22341c]">
            {terreno.titulo}
          </h3>

          <p className="mt-1 text-sm text-[#817d58]">
            {[terreno.municipio, terreno.estado_region]
              .filter(Boolean)
              .join(", ") || "Ubicación no definida"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-[#22341c]">
            ${Number(terreno.precio || 0).toLocaleString("es-MX")}
          </p>

          <p className="text-sm text-[#817d58]">
            {terreno.tipo || "Tipo no definido"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#fafaf7] p-3 text-sm">
          <div>
            <p className="text-[#817d58]">Área</p>
            <p className="font-medium text-[#22341c]">
              {terreno.area_m2 ? `${Math.round(terreno.area_m2)} m²` : "N/D"}
            </p>
          </div>

          <div>
            <p className="text-[#817d58]">Fecha</p>
            <p className="font-medium text-[#22341c]">
              {terreno.creado_en
                ? new Date(terreno.creado_en).toLocaleDateString("es-MX")
                : "N/D"}
            </p>
          </div>
        </div>

        {/* ACCIONES PRINCIPALES */}
        <div className="flex gap-3">
          <Link
            href={`/colaborador/misTerrenos/${terreno.id}/editar`}
            className="flex-1 rounded-xl bg-[#22341c] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#828d4b]"
          >
            Editar
          </Link>

          <Link
            href={`/terrenos/${terreno.id}`}
            className="flex-1 rounded-xl border border-[#817d58]/30 px-4 py-3 text-center text-sm font-medium text-[#22341c] transition hover:bg-[#f4f6ef]"
          >
            Ver
          </Link>
        </div>

        {/* ACCIONES SECUNDARIAS */}
        <div className="grid grid-cols-2 gap-3">
          {estado === "pausado" ? (
            <button
              type="button"
              onClick={reactivarTerreno}
              disabled={procesando}
              className="rounded-xl border border-[#426C8E]/30 px-4 py-3 text-sm font-medium text-[#426C8E] transition hover:bg-[#426C8E]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={pausarTerreno}
              disabled={procesando || estado !== "aprobado"}
              className="rounded-xl border border-[#817d58]/30 px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f4f6ef] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pausar
            </button>
          )}

          <button
            type="button"
            onClick={eliminarTerreno}
            disabled={procesando}
            className="rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>

        {/* MENSAJE AUXILIAR */}
        <p className="text-xs text-[#817d58]">
          {estado === "pausado"
            ? "Este terreno está pausado y no es visible públicamente."
            : "Puedes pausar o eliminar esta publicación desde aquí."}
        </p>
      </div>
    </div>
  );
}