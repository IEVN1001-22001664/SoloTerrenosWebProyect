"use client";

import { useState } from "react";
import { toast } from "sonner";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("Error al cambiar contraseña", {
          description: data.message,
        });
        return;
      }

      toast.success("Contraseña actualizada");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-[#22341c] mb-4">
          Cambiar contraseña
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Contraseña actual"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="Nueva contraseña"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#22341c] text-white"
          >
            {loading ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}