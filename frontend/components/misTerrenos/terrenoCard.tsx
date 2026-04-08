"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import {
  Info,
  CalendarClock,
  FileWarning,
  Clock3,
  ShieldCheck,
  PauseCircle,
  XCircle,
  Trash2,
} from "lucide-react";
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
  const router = useRouter();

  const [procesando, setProcesando] = useState<AccionTerreno>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<AccionTerreno>(null);
  const [estadoModalAbierto, setEstadoModalAbierto] = useState(false);
  const { user } = useAuth();

  const imagen = terreno.imagen_principal
    ? `http://localhost:5000${terreno.imagen_principal}`
    : "https://via.placeholder.com/600x400?text=Sin+imagen";

  const estado = (terreno.estado || "").toLowerCase();
  const ultimaRevisionEstado = (terreno.ultima_revision_estado || "").toLowerCase();
  const ultimaRevisionMensaje = terreno.ultima_revision_mensaje || "";
  const ultimaRevisionFecha = terreno.ultima_revision_fecha || null;

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

  const irAlDetalle = () => {
    router.push(`/colaborador/misTerrenos/${terreno.id}`);
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
    "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 cursor-pointer",
    "hover:-translate-y-1 hover:shadow-md",
    estado === "pausado"
      ? "border-[#817d58]/15 bg-[#f3f3ef] opacity-90"
      : estado === "rechazado"
      ? "border-red-200"
      : "border-[#817d58]/20",
  ].join(" ");

  const textoAuxiliar =
    estado === "pausado"
      ? "Este terreno está pausado y no es visible públicamente."
      : estado === "pendiente"
      ? "Esta publicación está en revisión administrativa."
      : estado === "rechazado"
      ? "Esta publicación fue rechazada y requiere correcciones."
      : "Puedes administrar esta publicación desde aquí.";

  const getEstadoVisual = () => {
    if (estado === "aprobado") {
      return {
        icon: <ShieldCheck size={18} className="text-green-600" />,
        title: "Publicación aprobada",
        text: "Tu terreno está aprobado y visible públicamente.",
      };
    }

    if (estado === "pendiente") {
      return {
        icon: <Clock3 size={18} className="text-[#9f885c]" />,
        title: "En revisión administrativa",
        text: "Tu publicación está pendiente de revisión por parte del administrador.",
      };
    }

    if (estado === "rechazado") {
      return {
        icon: <FileWarning size={18} className="text-red-600" />,
        title: "Publicación rechazada",
        text:
          ultimaRevisionMensaje ||
          "El administrador rechazó esta publicación. Revisa la observación y vuelve a postularla.",
      };
    }

    if (estado === "pausado") {
      return {
        icon: <PauseCircle size={18} className="text-slate-600" />,
        title: "Publicación pausada",
        text: "Ocultaste temporalmente este terreno del listado público.",
      };
    }

    return {
      icon: <XCircle size={18} className="text-[#817d58]" />,
      title: "Estado de la publicación",
      text: "Revisa el estado actual de esta publicación.",
    };
  };

  const estadoVisual = getEstadoVisual();

  return (
    <>
      <div className={cardClasses} onClick={irAlDetalle}>
        {/* IMAGEN */}
        <div className="relative">
          <img
            src={imagen}
            alt={terreno.titulo}
            className={`h-48 w-full object-cover transition duration-300 ${
              estado === "pausado" ? "grayscale" : "group-hover:scale-[1.02]"
            }`}
          />

          <div className="absolute left-3 top-3">
            <EstadoTerrenoBadge estado={terreno.estado || "Pendiente"} />
          </div>

          {/* ICONO ELIMINAR */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              abrirModal("eliminar");
            }}
            disabled={procesando !== null}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-[#22341c] shadow-sm backdrop-blur-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Eliminar terreno"
          >
            <Trash2 size={17} />
          </button>

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
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/colaborador/misTerrenos/${terreno.id}/editar`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl bg-[#22341c] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#2d4724]"
            >
              {estado === "rechazado" ? "Editar y reenviar" : "Editar"}
            </Link>

            {estado === "pausado" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModal("reactivar");
                }}
                disabled={procesando !== null}
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {procesando === "reactivar" ? "Reactivando..." : "Reactivar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModal("pausar");
                }}
                disabled={procesando !== null || estado !== "aprobado"}
                className="rounded-xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#ece9df] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {procesando === "pausar" ? "Pausando..." : "Pausar"}
              </button>
            )}
          </div>

          {/* ACCESO AL ESTADO */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEstadoModalAbierto(true);
            }}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              estado === "rechazado"
                ? "border-red-200 bg-red-50 hover:bg-red-100/70"
                : estado === "pendiente"
                ? "border-[#9f885c]/30 bg-[#9f885c]/10 hover:bg-[#9f885c]/20"
                : "border-[#817d58]/20 bg-[#fafaf7] hover:bg-[#f4f6ef]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
                <Info size={16} className="text-[#22341c]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#22341c]">
                  Ver estado de publicación
                </p>
                <p className="text-xs text-[#817d58]">
                  Revisa aprobación, observaciones y fechas
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold uppercase tracking-wide text-[#817d58]">
              Ver
            </span>
          </button>

          <p className="text-xs text-[#817d58]">{textoAuxiliar}</p>
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

      {/* MODAL DE ESTADO */}
      {estadoModalAbierto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setEstadoModalAbierto(false)}
          />

          <div
            className="relative z-[121] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#817d58]/20 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#817d58]/12 px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f6f1]">
                  {estadoVisual.icon}
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#22341c]">
                    Estado de la publicación
                  </h3>
                  <p className="mt-1 text-sm text-[#817d58]">
                    {terreno.titulo}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6 md:px-8">
              <div className="rounded-2xl bg-[#f7f6f1] p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                  Estado actual
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <EstadoTerrenoBadge estado={terreno.estado || "Pendiente"} />
                  <p className="text-sm text-[#4f4a3d]">{estadoVisual.text}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#817d58]/12 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Fecha de publicación
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#22341c]">
                    {terreno.creado_en
                      ? new Date(terreno.creado_en).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "No disponible"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#817d58]/12 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Última revisión
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#22341c]">
                    {ultimaRevisionFecha
                      ? new Date(ultimaRevisionFecha).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Sin revisión registrada"}
                  </p>
                </div>
              </div>

              {ultimaRevisionEstado && (
                <div className="rounded-2xl border border-[#817d58]/12 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Veredicto administrativo
                  </p>

                  <div className="mt-3">
                    <EstadoTerrenoBadge estado={ultimaRevisionEstado} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f7f6f1] p-4">
                    <p className="text-sm leading-6 text-[#4f4a3d]">
                      {ultimaRevisionMensaje || "No hay observaciones adicionales del administrador."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#817d58]/12 px-6 py-5 md:flex-row md:justify-end md:px-8">
              <button
                type="button"
                onClick={() => setEstadoModalAbierto(false)}
                className="rounded-2xl border border-[#817d58]/20 px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
              >
                Cerrar
              </button>

              {estado === "rechazado" && (
                <Link
                  href={`/colaborador/misTerrenos/${terreno.id}/editar`}
                  className="rounded-2xl bg-[#22341c] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#828d4b]"
                >
                  Editar y volver a postular
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}