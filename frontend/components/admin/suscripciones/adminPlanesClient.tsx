"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Power, Pencil } from "lucide-react";
import PlanModal from "./planModal";

interface Plan {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio_mensual?: number;
  precio_anual?: number;
  moneda?: string;
  limite_terrenos?: number | null;
  permite_destacados: boolean;
  duracion_dias_trial: number;
  activo: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPlanesClient() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [planEditando, setPlanEditando] = useState<Plan | null>(null);

  const fetchPlanes = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/suscripciones/admin/planes`, {
        credentials: "include",
      });

      const data = await res.json();

      setPlanes(data || []);
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const toggleActivo = async (plan: Plan) => {
    try {
      await fetch(
        `${API_URL}/api/suscripciones/admin/planes/${plan.id}/activo`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: !plan.activo }),
        }
      );

      fetchPlanes();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return planes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q)
    );
  }, [planes, busqueda]);

  return (
  <div className="space-y-6">

    {/* HEADER */}
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Planes</h1>
        <p className="text-sm text-slate-500">
          Configura precios, límites y beneficios de cada membresía.
        </p>
      </div>

      <div className="flex gap-2">
        <button
        disabled
        title="La creación de planes está deshabilitada temporalmente para evitar inconsistencias con Stripe y la configuración actual."
        className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
        >
        <Plus size={16} />
        Nuevo
        </button>

        <button
          onClick={fetchPlanes}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>
    </div>

    {/* BUSCADOR */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar plan..."
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-slate-300"
      />
    </div>

    {/* CONTENIDO */}
    {loading ? (
      <div className="p-6 text-sm text-slate-500">Cargando planes...</div>
    ) : filtrados.length === 0 ? (
      <div className="p-6 text-sm text-slate-500">
        No se encontraron planes.
      </div>
    ) : (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {filtrados.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            {/* HEADER CARD */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {plan.nombre}
                </h3>
                <p className="text-xs text-slate-400">{plan.codigo}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium
                  ${
                    plan.activo
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }
                `}
              >
                {plan.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* PRECIO */}
            <div className="mt-4">
              <p className="text-lg font-bold text-slate-800">
                ${Number(plan.precio_mensual || 0).toLocaleString("es-MX")}
              </p>
              <p className="text-xs text-slate-500">mensual</p>
            </div>

            {/* INFO */}
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>
                {plan.limite_terrenos === null || plan.limite_terrenos === undefined
                  ? "Ilimitado"
                  : `${plan.limite_terrenos} terrenos`}
              </p>

              <p>
                Destacados:{" "}
                <span className="font-medium">
                  {plan.permite_destacados ? "Sí" : "No"}
                </span>
              </p>
            </div>

            {/* ACCIONES */}
            <div className="mt-4 flex gap-2">

              {/* EDITAR */}
              <button
                onClick={() => {
                  setPlanEditando(plan);
                  setModalOpen(true);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition"
                title="Editar plan"
              >
                <Pencil size={15} className="text-blue-600" />
              </button>

              {/* ACTIVAR / DESACTIVAR */}
              <button
                onClick={() => toggleActivo(plan)}
                className={`flex items-center justify-center w-9 h-9 rounded-lg border transition
                  ${
                    plan.activo
                      ? "bg-red-50 border-red-200 hover:bg-red-100"
                      : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  }
                `}
                title={plan.activo ? "Desactivar plan" : "Activar plan"}
              >
                <Power
                  size={15}
                  className={plan.activo ? "text-red-600" : "text-emerald-600"}
                />
              </button>

            </div>
          </div>
        ))}

      </div>
    )}

    {/* MODAL */}
    <PlanModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      onSuccess={fetchPlanes}
      plan={planEditando}
    />

  </div>
);
}