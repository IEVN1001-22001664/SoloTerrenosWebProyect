"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Search, MessageCircle, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  referencia_id?: number;
  referencia_tipo?: string;
  canal?: string;
  estado_envio?: string;
  metadata?: any;
  creado_en: string;
  actualizado_en?: string;
}

export default function ColaboradorNotificacionesPage() {
  const { user, loading } = useAuth();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchNotificaciones();
  }, [loading, user]);

  const fetchNotificaciones = async () => {
    try {
      setCargando(true);

      const response = await fetch(
        "http://localhost:5000/api/notificaciones/mis-notificaciones",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron cargar las notificaciones.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        setNotificaciones([]);
        return;
      }

      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      toast.error("Error al cargar notificaciones.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notificaciones/${id}/leer`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo actualizar la notificación.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error marcando notificación:", error);
    }
  };

  const marcarTodas = async () => {
    try {
      setProcesando(true);

      const response = await fetch(
        "http://localhost:5000/api/notificaciones/leer-todas",
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron actualizar las notificaciones.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leida: true }))
      );

      toast.success("Notificaciones actualizadas correctamente.");
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      toast.error("Error al actualizar notificaciones.");
    } finally {
      setProcesando(false);
    }
  };

  const notificacionesFiltradas = useMemo(() => {
    let resultado = [...notificaciones];

    if (soloNoLeidas) {
      resultado = resultado.filter((n) => !n.leida);
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((n) => {
        const titulo = (n.titulo || "").toLowerCase();
        const mensaje = (n.mensaje || "").toLowerCase();
        const tipo = (n.tipo || "").toLowerCase();

        return (
          titulo.includes(texto) ||
          mensaje.includes(texto) ||
          tipo.includes(texto)
        );
      });
    }

    return resultado;
  }, [notificaciones, soloNoLeidas, busqueda]);

  const totalNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getIcono = (tipo: string) => {
    if (tipo === "mensaje_nuevo") {
      return <MessageCircle size={18} className="text-[#22341c]" />;
    }

    if (tipo === "lead_nuevo") {
      return <UserRound size={18} className="text-[#22341c]" />;
    }

    return <Bell size={18} className="text-[#22341c]" />;
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#22341c]">Notificaciones</h1>
            <p className="mt-1 text-sm text-[#817d58]">
              Mantente al tanto de nuevos leads, mensajes y actividad del sistema.
            </p>
          </div>

          <div className="rounded-2xl border border-[#817d58]/12 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
              Sin leer
            </p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">
              {totalNoLeidas}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[1.8rem] border border-[#817d58]/12 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f6f1] px-4 py-3">
            <Search size={18} className="text-[#817d58]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar notificaciones..."
              className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]"
            />
          </div>

          <label className="flex items-center gap-2 rounded-2xl bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c]">
            <input
              type="checkbox"
              checked={soloNoLeidas}
              onChange={() => setSoloNoLeidas((prev) => !prev)}
              className="accent-[#828d4b]"
            />
            Solo no leídas
          </label>

          <button
            type="button"
            onClick={marcarTodas}
            disabled={procesando || totalNoLeidas === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
          >
            <CheckCheck size={16} />
            Marcar todas
          </button>
        </div>

        {cargando ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando notificaciones...
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#22341c]">
              No hay notificaciones
            </h2>
            <p className="mt-2 text-sm text-[#817d58]">
              Cuando haya actividad relevante en tu cuenta, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificacionesFiltradas.map((notificacion) => (
              <article
                key={notificacion.id}
                className={`rounded-[1.6rem] border bg-white p-5 shadow-sm transition ${
                  notificacion.leida
                    ? "border-[#817d58]/10"
                    : "border-[#828d4b]/30 ring-1 ring-[#828d4b]/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7f6f1]">
                    {getIcono(notificacion.tipo)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-[#22341c]">
                          {notificacion.titulo}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[#4f4a3d]">
                          {notificacion.mensaje}
                        </p>
                      </div>

                      {!notificacion.leida && (
                        <button
                          type="button"
                          onClick={() => marcarComoLeida(notificacion.id)}
                          className="self-start rounded-xl border border-[#817d58]/15 px-3 py-2 text-xs font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#817d58]">
                      <span>{formatFecha(notificacion.creado_en)}</span>
                      <span className="rounded-full bg-[#f7f6f1] px-2.5 py-1">
                        {notificacion.tipo}
                      </span>
                      <span className="rounded-full bg-[#f7f6f1] px-2.5 py-1">
                        {notificacion.canal || "interno"}
                      </span>
                      <span className="rounded-full bg-[#f7f6f1] px-2.5 py-1">
                        {notificacion.leida ? "Leída" : "Nueva"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}