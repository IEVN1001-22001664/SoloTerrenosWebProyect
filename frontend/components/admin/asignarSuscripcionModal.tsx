"use client";

import { useEffect, useState } from "react";
import { X, CalendarDays, User, CreditCard, FileText } from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  apellido?: string | null;
  email: string;
  rol?: string;
}

interface Plan {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AsignarSuscripcionModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);

  const [usuarioId, setUsuarioId] = useState("");
  const [planId, setPlanId] = useState("");
  const [dias, setDias] = useState("30");
  const [usarComoTrial, setUsarComoTrial] = useState(false);
  const [observaciones, setObservaciones] = useState("");

  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!open) return;

    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);
        setError("");

        const [usersRes, planesRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/users`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_URL}/api/suscripciones/planes`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        const usersData = await usersRes.json();
        const planesData = await planesRes.json();

        if (!usersRes.ok) {
          throw new Error(usersData?.message || "No fue posible cargar usuarios.");
        }

        if (!planesRes.ok) {
          throw new Error(planesData?.message || "No fue posible cargar planes.");
        }

        setUsuarios(Array.isArray(usersData) ? usersData : []);
        setPlanes(Array.isArray(planesData) ? planesData : []);
      } catch (err: any) {
        console.error("Error cargando datos del modal:", err);
        setError(err?.message || "Error cargando datos para asignar suscripción.");
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [open, API_URL]);

  const limpiarFormulario = () => {
    setUsuarioId("");
    setPlanId("");
    setDias("30");
    setUsarComoTrial(false);
    setObservaciones("");
    setError("");
  };

  const cerrarModal = () => {
    if (loading) return;
    limpiarFormulario();
    onClose();
  };

  const calcularFechas = (diasNumero: number) => {
    const ahora = new Date();
    const fin = new Date(ahora);
    fin.setDate(fin.getDate() + diasNumero);

    return {
      fecha_inicio: ahora.toISOString(),
      fecha_fin: fin.toISOString(),
    };
  };

  const handleSubmit = async () => {
    try {
      setError("");

      if (!usuarioId) {
        setError("Debes seleccionar un usuario.");
        return;
      }

      if (!planId) {
        setError("Debes seleccionar un plan.");
        return;
      }

      const diasNumero = Number(dias);

      if (Number.isNaN(diasNumero) || diasNumero <= 0) {
        setError("Debes ingresar una duración válida en días.");
        return;
      }

      const { fecha_inicio, fecha_fin } = calcularFechas(diasNumero);

      setLoading(true);

      const payload = {
        usuario_id: Number(usuarioId),
        plan_id: Number(planId),
        fecha_inicio,
        fecha_fin,
        observaciones: observaciones.trim() || null,
        usar_como_trial: usarComoTrial,
      };

      const res = await fetch(`${API_URL}/api/suscripciones/admin/asignar`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Error al asignar suscripción.");
        return;
      }

      onSuccess();
      limpiarFormulario();
      onClose();
    } catch (err) {
      console.error("Error asignando suscripción:", err);
      setError("Ocurrió un error inesperado al asignar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Asignar suscripción manual
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Crea una suscripción manual o un periodo de prueba para un usuario.
            </p>
          </div>

          <button
            onClick={cerrarModal}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {cargandoDatos ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Cargando usuarios y planes...
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <User className="h-4 w-4" />
                    Usuario
                  </label>
                  <select
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido || ""} - {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CreditCard className="h-4 w-4" />
                    Plan
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                  >
                    <option value="">Seleccionar plan</option>
                    {planes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4" />
                    Duración en días
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dias}
                    onChange={(e) => setDias(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                    placeholder="Ej. 30"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={usarComoTrial}
                      onChange={(e) => setUsarComoTrial(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Asignar como trial
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
                  placeholder="Ej. Activación promocional por lanzamiento, trial extendido, acceso estratégico, etc."
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                La fecha de inicio se tomará como el momento actual y la fecha de fin se
                calculará automáticamente según los días indicados.
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={cerrarModal}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || cargandoDatos}
            className="rounded-xl bg-[#828d4b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Asignando..." : "Asignar suscripción"}
          </button>
        </div>
      </div>
    </div>
  );
}