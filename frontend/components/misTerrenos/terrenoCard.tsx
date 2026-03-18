"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import EstadoTerrenoBadge from "./estadoTerrenoBadge";
import ConfirmModal from "@/components/ui/confirmModal";

interface Props {
  terreno: any;
  onEstadoChange: (id: number, nuevoEstado: string) => void;
  onDelete: (id: number) => void;
}

type AccionTerreno = "pausar" | "reactivar" | "eliminar" | null;

export default function TerrenoCard({
  terreno,
  onEstadoChange,
  onDelete,
}: Props) {
  const [procesando, setProcesando] = useState<AccionTerreno>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<AccionTerreno>(null);

  const imagen = terreno.imagen_principal
    ? `http://localhost:5000${terreno.imagen_principal}`
    : "https://via.placeholder.com/600x400?text=Sin+imagen";

  const estado = (terreno.estado || "").toLowerCase();

  const abrirModal = (accion: Exclude<AccionTerreno, null>) => {
    if (procesando !== null) return;
    setAccionPendiente(accion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (procesando !== null) return;
    setModalAbierto(false);
    setAccionPendiente(null);
  };

  const pausarTerreno = async () => {
    try {
      setProcesando("pausar");

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}/pausar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo pausar el terreno.", {
          description:
            data.message ||
            "Ocurrió un problema al intentar cambiar el estado de la publicación.",
        });
        return;
      }

      onEstadoChange(terreno.id, "pausado");
      cerrarModal();

      toast.success("Terreno pausado correctamente.", {
        description:
          "La publicación dejó de estar visible para los usuarios.",
      });
    } catch (error) {
      console.error("Error pausando terreno:", error);
      toast.error("Ocurrió un error al pausar el terreno.", {
        description:
          "Verifica tu conexión o inténtalo nuevamente en unos momentos.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const reactivarTerreno = async () => {
    try {
      setProcesando("reactivar");

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}/reactivar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo reactivar el terreno.", {
          description:
            data.message ||
            "Ocurrió un problema al intentar volver a publicar este terreno.",
        });
        return;
      }

      onEstadoChange(terreno.id, "aprobado");
      cerrarModal();

      toast.success("Terreno reactivado correctamente.", {
        description:
          "La publicación vuelve a estar visible para los usuarios.",
      });
    } catch (error) {
      console.error("Error reactivando terreno:", error);
      toast.error("Ocurrió un error al reactivar el terreno.", {
        description:
          "Verifica tu conexión o inténtalo nuevamente en unos momentos.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const eliminarTerreno = async () => {
    try {
      setProcesando("eliminar");

      const response = await fetch(
        `http://localhost:5000/api/terrenos/${terreno.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo eliminar el terreno.", {
          description:
            data.message ||
            "Ocurrió un problema al intentar eliminar esta publicación.",
        });
        return;
      }

      onDelete(terreno.id);
      cerrarModal();

      toast.success("Terreno eliminado correctamente.", {
        description:
          "La publicación fue retirada de tu listado de terrenos.",
      });
    } catch (error) {
      console.error("Error eliminando terreno:", error);
      toast.error("Ocurrió un error al eliminar el terreno.", {
        description:
          "Verifica tu conexión o inténtalo nuevamente en unos momentos.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const ejecutarAccionConfirmada = async () => {
    if (accionPendiente === "pausar") {
      await pausarTerreno();
      return;
    }

    if (accionPendiente === "reactivar") {
      await reactivarTerreno();
      return;
    }

    if (accionPendiente === "eliminar") {
      await eliminarTerreno();
    }
  };

  const modalConfig = {
    pausar: {
      title: "Pausar publicación",
      message:
        "Mientras este terreno esté pausado, dejará de ser visible públicamente para los usuarios. Podrás reactivarlo cuando lo necesites.",
      confirmText: "Sí, pausar",
      variant: "warning" as const,
    },
    reactivar: {
      title: "Reactivar publicación",
      message:
        "Este terreno volverá a estar visible públicamente y podrá recibir visitas e interés nuevamente.",
      confirmText: "Sí, reactivar",
      variant: "success" as const,
    },
    eliminar: {
      title: "Eliminar terreno",
      message:
        "Esta acción eliminará el terreno y no podrás recuperarlo después. Asegúrate de querer continuar.",
      confirmText: "Sí, eliminar",
      variant: "danger" as const,
    },
  };

  const configActual = accionPendiente ? modalConfig[accionPendiente] : null;

  const cardClasses = [
    "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300",
    "hover:-translate-y-1 hover:shadow-md",
    estado === "pausado"
      ? "border-[#817d58]/15 bg-[#f3f3ef] opacity-80"
      : "border-[#817d58]/20",
  ].join(" ");

  return (
    <>
      <div className={cardClasses}>
        {/* IMAGEN */}
        <div className="relative">
          <img
            src={imagen}
            alt={terreno.titulo}
            className={`h-52 w-full object-cover transition duration-300 ${
              estado === "pausado" ? "grayscale" : "group-hover:scale-[1.02]"
            }`}
          />

          <div className="absolute left-3 top-3">
            <EstadoTerrenoBadge estado={terreno.estado || "Pendiente"} />
          </div>

          {estado === "pausado" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="rounded-full border border-white/40 bg-white/90 px-4 py-2 text-xs font-semibold tracking-wide text-[#22341c] shadow-sm backdrop-blur-sm">
                PUBLICACIÓN PAUSADA
              </span>
            </div>
          )}
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

          <div
            className={`grid grid-cols-2 gap-3 rounded-xl p-3 text-sm transition ${
              estado === "pausado" ? "bg-[#efefe9]" : "bg-[#fafaf7]"
            }`}
          >
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
              className="flex-1 rounded-xl bg-[#22341c] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#2d4724]"
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
                onClick={() => abrirModal("reactivar")}
                disabled={procesando !== null}
                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {procesando === "reactivar" ? "Reactivando..." : "Reactivar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => abrirModal("pausar")}
                disabled={procesando !== null || estado !== "aprobado"}
                className="rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-yellow-600 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesando === "pausar" ? "Pausando..." : "Pausar"}
              </button>
            )}

            <button
              type="button"
              onClick={() => abrirModal("eliminar")}
              disabled={procesando !== null}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {procesando === "eliminar" ? "Eliminando..." : "Eliminar"}
            </button>
          </div>

          {/* MENSAJE AUXILIAR */}
          <p className="text-xs text-[#817d58]">
            {estado === "pausado"
              ? "Este terreno está pausado y no es visible públicamente."
              : estado === "pendiente"
              ? "Esta publicación está en revisión antes de mostrarse públicamente."
              : "Puedes pausar o eliminar esta publicación desde aquí."}
          </p>
        </div>
      </div>

      {configActual && (
        <ConfirmModal
          open={modalAbierto}
          title={configActual.title}
          message={configActual.message}
          confirmText={configActual.confirmText}
          cancelText="Cancelar"
          variant={configActual.variant}
          loading={procesando !== null}
          onConfirm={ejecutarAccionConfirmada}
          onClose={cerrarModal}
        />
      )}
    </>
  );
}