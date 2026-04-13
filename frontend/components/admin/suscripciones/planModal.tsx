"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PlanModal({ open, onClose, onSuccess, plan }: any) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setForm(
      plan || {
        codigo: "",
        nombre: "",
        descripcion: "",
        precio_mensual: "",
        precio_anual: "",
        moneda: "MXN",
        limite_terrenos: "",
        permite_destacados: false,
        duracion_dias_trial: 0,
        activo: true,
      }
    );
  }, [plan]);

  if (!open) return null;

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const guardar = async () => {
    const endpoint = plan
      ? `${API_URL}/api/suscripciones/admin/planes/${plan.id}`
      : `${API_URL}/api/suscripciones/admin/planes`;

    const method = plan ? "PUT" : "POST";

    await fetch(endpoint, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        descripcion: form.descripcion,
        limite_terrenos:
            form.limite_terrenos === "" ? null : Number(form.limite_terrenos),
        permite_destacados: !!form.permite_destacados,
        duracion_dias_trial: Number(form.duracion_dias_trial || 0),
        activo: !!form.activo,

        // campos protegidos que se conservan tal cual
        codigo: form.codigo,
        precio_mensual: form.precio_mensual,
        precio_anual: form.precio_anual,
        moneda: form.moneda,
        stripe_price_id_mensual: form.stripe_price_id_mensual,
        stripe_price_id_anual: form.stripe_price_id_anual,
        }),
    });

    onSuccess();
    onClose();
  };

 return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white p-6 rounded-2xl w-full max-w-2xl space-y-5 shadow-lg">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Editar plan
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Solo se muestran campos seguros para evitar inconsistencias con Stripe y la lógica interna del sistema.
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label className="text-xs text-slate-500">Nombre visible del plan</label>
        <input
          name="nombre"
          value={form.nombre || ""}
          onChange={handleChange}
          placeholder="Ej: Básico 3 Terrenos"
          className="w-full mt-1 p-3 border rounded-xl"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="text-xs text-slate-500">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion || ""}
          onChange={handleChange}
          placeholder="Describe brevemente qué incluye este plan"
          className="w-full mt-1 p-3 border rounded-xl min-h-[100px]"
        />
      </div>

      {/* Límite */}
      <div>
        <label className="text-xs text-slate-500">
          Límite de terrenos
        </label>
        <input
          name="limite_terrenos"
          value={form.limite_terrenos ?? ""}
          onChange={handleChange}
          placeholder="Vacío = ilimitado"
          className="w-full mt-1 p-3 border rounded-xl"
        />
      </div>

      {/* Trial */}
      <div>
        <label className="text-xs text-slate-500">
          Duración del trial en días
        </label>
        <input
          name="duracion_dias_trial"
          value={form.duracion_dias_trial ?? 0}
          onChange={handleChange}
          placeholder="Ej: 7"
          className="w-full mt-1 p-3 border rounded-xl"
        />
      </div>

      {/* Checkboxes */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 rounded-xl border p-3">
          <input
            type="checkbox"
            name="permite_destacados"
            checked={!!form.permite_destacados}
            onChange={handleChange}
          />
          Permite publicaciones destacadas
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700 rounded-xl border p-3">
          <input
            type="checkbox"
            name="activo"
            checked={!!form.activo}
            onChange={handleChange}
          />
          Plan activo
        </label>
      </div>

      {/* Campos solo lectura */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          Campos protegidos
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-slate-500">Precio mensual</p>
            <p className="font-medium text-slate-800">
              {form.precio_mensual ?? "No disponible"}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Precio anual</p>
            <p className="font-medium text-slate-800">
              {form.precio_anual ?? "No disponible"}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Moneda</p>
            <p className="font-medium text-slate-800">
              {form.moneda || "MXN"}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Código interno</p>
            <p className="font-medium text-slate-800">
              {form.codigo || "No disponible"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 hover:text-black"
        >
          Cancelar
        </button>

        <button
          onClick={guardar}
          className="bg-[#828d4b] text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
);   
}