"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  FileText,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  X,
} from "lucide-react";
import { apiFetch } from "@/src/lib/api";

interface Publicacion {
  id: number;
  titulo: string;
  estado: string;
  usuario: string;
  creado_en?: string;
}

type AccionAdmin = "aprobar" | "rechazar" | "eliminar" | null;

export default function PublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [accionActiva, setAccionActiva] = useState<AccionAdmin>(null);
  const [publicacionActiva, setPublicacionActiva] = useState<Publicacion | null>(null);
  const [mensajeRevision, setMensajeRevision] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/admin/publicaciones");
      setPublicaciones(data);
    } catch (error) {
      console.error("Error cargando publicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (accion: AccionAdmin, publicacion: Publicacion) => {
    setAccionActiva(accion);
    setPublicacionActiva(publicacion);

    if (accion === "aprobar") {
      setMensajeRevision("Tu publicación fue aprobada correctamente.");
    } else if (accion === "rechazar") {
      setMensajeRevision("");
    } else {
      setMensajeRevision("");
    }
  };

  const cerrarModal = () => {
    if (procesando) return;
    setAccionActiva(null);
    setPublicacionActiva(null);
    setMensajeRevision("");
  };

  const cambiarEstado = async (id: number, nuevoEstado: string, mensaje?: string) => {
    await apiFetch(`/api/admin/publicaciones/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({
        estado: nuevoEstado,
        mensaje: mensaje || null,
      }),
    });

    setPublicaciones((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: nuevoEstado } : p
      )
    );
  };

  const eliminarPublicacion = async (id: number) => {
    await apiFetch(`/api/admin/publicaciones/${id}`, {
      method: "DELETE",
    });

    setPublicaciones((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: "eliminado" } : p
      )
    );
  };

  const confirmarAccion = async () => {
    if (!publicacionActiva || !accionActiva) return;

    try {
      setProcesando(true);

      if (accionActiva === "aprobar") {
        await cambiarEstado(publicacionActiva.id, "aprobado", mensajeRevision);
      }

      if (accionActiva === "rechazar") {
        if (!mensajeRevision.trim()) {
          alert("Debes escribir una observación para rechazar la publicación.");
          setProcesando(false);
          return;
        }

        await cambiarEstado(publicacionActiva.id, "rechazado", mensajeRevision);
      }

      if (accionActiva === "eliminar") {
        await eliminarPublicacion(publicacionActiva.id);
      }

      cerrarModal();
    } catch (error) {
      console.error("Error ejecutando acción:", error);
      alert("Ocurrió un error al procesar la acción.");
    } finally {
      setProcesando(false);
    }
  };

  const publicacionesFiltradas = useMemo(() => {
    let resultado = [...publicaciones];

    if (filtroEstado !== "todos") {
      resultado = resultado.filter(
        (pub) => (pub.estado || "").toLowerCase() === filtroEstado
      );
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((pub) => {
        const titulo = (pub.titulo || "").toLowerCase();
        const usuario = (pub.usuario || "").toLowerCase();
        const estado = (pub.estado || "").toLowerCase();

        return (
          titulo.includes(texto) ||
          usuario.includes(texto) ||
          estado.includes(texto)
        );
      });
    }

    return resultado;
  }, [publicaciones, filtroEstado, busqueda]);

  const total = publicaciones.length;
  const totalPendientes = publicaciones.filter((p) => p.estado === "pendiente").length;
  const totalAprobadas = publicaciones.filter((p) => p.estado === "aprobado").length;
  const totalRechazadas = publicaciones.filter((p) => p.estado === "rechazado").length;

  const getEstadoBadge = (estado: string) => {
    const estadoNormalizado = (estado || "").toLowerCase();

    if (estadoNormalizado === "aprobado") {
      return "bg-[#828d4b]/15 text-[#22341c]";
    }

    if (estadoNormalizado === "rechazado") {
      return "bg-red-100 text-red-700";
    }

    if (estadoNormalizado === "pendiente") {
      return "bg-[#9f885c]/15 text-[#817d58]";
    }

    if (estadoNormalizado === "pausado") {
      return "bg-slate-100 text-slate-700";
    }

    if (estadoNormalizado === "eliminado") {
      return "bg-gray-200 text-gray-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] p-6">
        <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
          Cargando publicaciones...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#22341c]">
              Administrar publicaciones
            </h1>
            <p className="mt-1 text-sm text-[#817d58]">
              Revisa, filtra y dictamina el estado de los terrenos publicados.
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <FileText className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Total</p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">{total}</p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <Clock3 className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Pendientes</p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">{totalPendientes}</p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
              <ShieldCheck className="text-[#22341c]" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Aprobadas</p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">{totalAprobadas}</p>
          </div>

          <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <p className="text-sm text-[#817d58]">Rechazadas</p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">{totalRechazadas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 grid gap-4 rounded-[1.8rem] border border-[#817d58]/12 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_220px]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f6f1] px-4 py-3">
            <Search size={18} className="text-[#817d58]" />
            <input
              type="text"
              placeholder="Buscar por título, usuario o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f6f1] px-4 py-3">
            <Filter size={18} className="text-[#817d58]" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full bg-transparent text-sm text-[#22341c] outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="pausado">Pausado</option>
              <option value="eliminado">Eliminado</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-[1.8rem] border border-[#817d58]/12 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-[#817d58]/10 bg-[#faf9f5]">
                <tr className="text-left text-sm text-[#817d58]">
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Título</th>
                  <th className="px-5 py-4 font-medium">Colaborador</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {publicacionesFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-[#817d58]"
                    >
                      No hay publicaciones para mostrar.
                    </td>
                  </tr>
                ) : (
                  publicacionesFiltradas.map((pub) => (
                    <tr
                      key={pub.id}
                      className="border-b border-[#817d58]/8 text-sm last:border-b-0"
                    >
                      <td className="px-5 py-4 font-medium text-[#22341c]">
                        #{pub.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-[#22341c]">{pub.titulo}</p>
                      </td>

                      <td className="px-5 py-4 text-[#4f4a3d]">
                        {pub.usuario}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getEstadoBadge(
                            pub.estado
                          )}`}
                        >
                          {pub.estado}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => abrirModal("aprobar", pub)}
                            className="rounded-xl bg-[#22341c] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#828d4b]"
                          >
                            Aprobar
                          </button>

                          <button
                            onClick={() => abrirModal("rechazar", pub)}
                            className="rounded-xl border border-[#9f885c]/30 bg-[#9f885c]/15 px-3 py-2 text-xs font-medium text-[#22341c] transition hover:bg-[#9f885c]/25"
                          >
                            Rechazar
                          </button>

                          <button
                            onClick={() => abrirModal("eliminar", pub)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {accionActiva && publicacionActiva && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={cerrarModal}
          />

          <div
            className="relative z-[121] w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#817d58]/20 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#817d58]/12 px-6 py-5 md:px-8">
              <div>
                <h3 className="text-2xl font-semibold text-[#22341c]">
                  {accionActiva === "aprobar" && "Aprobar publicación"}
                  {accionActiva === "rechazar" && "Rechazar publicación"}
                  {accionActiva === "eliminar" && "Eliminar publicación"}
                </h3>

                <p className="mt-1 text-sm text-[#817d58]">
                  {publicacionActiva.titulo}
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={procesando}
                className="ml-4 flex h-10 w-10 items-center justify-center rounded-full text-[#817d58] transition hover:bg-[#f7f6f1] hover:text-[#22341c] disabled:opacity-60"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6 md:px-8">
              {accionActiva === "aprobar" && (
                <>
                  <p className="text-sm leading-6 text-[#4f4a3d]">
                    Esta acción hará visible públicamente la publicación si cumple con los criterios del sistema.
                  </p>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#22341c]">
                      Mensaje para el colaborador
                    </label>
                    <textarea
                      value={mensajeRevision}
                      onChange={(e) => setMensajeRevision(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                      placeholder="Escribe un mensaje opcional"
                    />
                  </div>
                </>
              )}

              {accionActiva === "rechazar" && (
                <>
                  <p className="text-sm leading-6 text-[#4f4a3d]">
                    Escribe una observación clara para que el colaborador pueda corregir y volver a postular la publicación.
                  </p>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#22341c]">
                      Observación obligatoria
                    </label>
                    <textarea
                      value={mensajeRevision}
                      onChange={(e) => setMensajeRevision(e.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                      placeholder="Ejemplo: Tu terreno no cumple con los parámetros mínimos de área según la documentación presentada..."
                    />
                  </div>
                </>
              )}

              {accionActiva === "eliminar" && (
                <p className="text-sm leading-6 text-[#4f4a3d]">
                  Esta acción enviará la publicación a borrados lógicos y dejará de estar disponible para la operación normal.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#817d58]/12 px-6 py-5 md:flex-row md:justify-end md:px-8">
              <button
                type="button"
                onClick={cerrarModal}
                disabled={procesando}
                className="rounded-2xl border border-[#817d58]/20 px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1] disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarAccion}
                disabled={procesando}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
                  accionActiva === "aprobar"
                    ? "bg-[#22341c] hover:bg-[#828d4b]"
                    : accionActiva === "rechazar"
                    ? "bg-[#9f885c] hover:bg-[#817d58]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {procesando
                  ? "Procesando..."
                  : accionActiva === "aprobar"
                  ? "Confirmar aprobación"
                  : accionActiva === "rechazar"
                  ? "Confirmar rechazo"
                  : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}