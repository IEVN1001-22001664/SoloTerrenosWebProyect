"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Save, Shield } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UsuarioConfiguracionPage() {
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      telefono: user.telefono || "",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      const response = await fetch(`${API_URL}/api/usuarios/actualizar`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron guardar los cambios", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      toast.success("Datos actualizados correctamente");
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* HEADER */}
        <section>
          <h1 className="text-3xl font-bold text-[#22341c]">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-[#817d58]">
            Administra tu información personal y preferencias.
          </p>
        </section>

        {/* DATOS PERSONALES */}
        <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15">
              <User size={18} className="text-[#22341c]" />
            </div>
            <h2 className="text-lg font-semibold text-[#22341c]">
              Datos personales
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-[#817d58]">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#9f885c]/35"
              />
            </div>

            <div>
              <label className="text-sm text-[#817d58]">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#9f885c]/35"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-[#817d58]">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#9f885c]/35"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={guardarCambios}
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
            >
              <Save size={16} />
              Guardar cambios
            </button>
          </div>
        </section>

        {/* SEGURIDAD (BÁSICO) */}
        <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15">
              <Shield size={18} className="text-[#22341c]" />
            </div>
            <h2 className="text-lg font-semibold text-[#22341c]">
              Seguridad
            </h2>
          </div>

          <p className="text-sm text-[#817d58]">
            Próximamente podrás cambiar tu contraseña y configurar opciones de seguridad.
          </p>
        </section>
      </div>
    </main>
  );
}