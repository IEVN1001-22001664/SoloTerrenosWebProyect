"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  KeyRound,
  Save,
  MapPinned,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/profile/changePasswordModal";
import ProfileAvatar from "@/components/profile/profileAvatar";
import ProfileImageModal from "@/components/profile/profileImageModal";

const API_URL = "http://localhost:5000";

export default function UsuarioPerfilPage() {
  const { user, loading, updateUser, refreshUser } = useAuth();

  const [guardando, setGuardando] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modalFotoOpen, setModalFotoOpen] = useState(false);

  const [fotoVersion, setFotoVersion] = useState(Date.now());

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ciudad: "",
    direccion: "",
  });

  const [meta, setMeta] = useState({
    rol: "",
    fecha_nacimiento: "",
    foto_perfil: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchProfile();
  }, [loading, user]);

  const fetchProfile = async () => {
    try {
      setCargandoPerfil(true);

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo cargar el perfil.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      const profile = data.profile;

      setForm({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        email: profile.email || "",
        telefono: profile.telefono || "",
        ciudad: profile.ciudad || "",
        direccion: profile.direccion || "",
      });

      setMeta({
        rol: profile.rol || "",
        fecha_nacimiento: profile.fecha_nacimiento || "",
        foto_perfil: profile.foto_perfil || "",
      });

      setFotoVersion(Date.now());
    } catch (error) {
      console.error("Error cargando perfil:", error);
      toast.error("Error al cargar el perfil.");
    } finally {
      setCargandoPerfil(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setGuardando(true);

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron guardar los cambios.", {
          description:
            data.message ||
            "Verifica la información e inténtalo nuevamente.",
        });
        return;
      }

      toast.success("Perfil actualizado correctamente.", {
        description: "Tus datos se guardaron correctamente.",
      });

      await fetchProfile();
    } catch (error) {
      console.error("Error guardando perfil:", error);
      toast.error("Ocurrió un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const handleSaveProfileImage = async (file: File) => {
    try {
      setSubiendoFoto(true);

      const formData = new FormData();
      formData.append("foto", file);

      const response = await fetch(`${API_URL}/api/auth/upload-profile-photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo subir la foto.");
      }

      updateUser({ foto_perfil: data.foto_perfil });

      toast.success("Foto de perfil actualizada correctamente.");

      await refreshUser();
      await fetchProfile();
      setFotoVersion(Date.now());
    } catch (error: any) {
      console.error("Error subiendo foto:", error);
      toast.error("Ocurrió un error al subir la foto.", {
        description: error.message || "Inténtalo nuevamente.",
      });
      throw error;
    } finally {
      setSubiendoFoto(false);
    }
  };

  const fotoPerfilUrl = useMemo(() => {
    if (!meta.foto_perfil) return "";
    return `${API_URL}${meta.foto_perfil}?v=${fotoVersion}`;
  }, [meta.foto_perfil, fotoVersion]);

  if (loading || cargandoPerfil) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando perfil...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#22341c]">
              <User size={14} />
              Perfil de usuario
            </div>

            <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
              Mi perfil y cuenta
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#817d58] md:text-base">
              Administra tu información personal, foto de perfil y datos de
              contacto como comprador dentro de la plataforma.
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <ProfileAvatar
                  imageUrl={fotoPerfilUrl || null}
                  size={96}
                  editable
                  onEdit={() => setModalFotoOpen(true)}
                />
              </div>

              <h2 className="text-xl font-semibold text-[#22341c]">
                {form.nombre} {form.apellido}
              </h2>

              <p className="mt-1 text-sm text-[#817d58]">
                Espacio personal para gestionar tus intereses, favoritos y
                conversaciones.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold text-[#22341c]">
                  {meta.rol || "usuario"}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#faf9f5] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#22341c]">
                    Foto de perfil
                  </p>
                  <p className="mt-1 text-xs text-[#817d58]">
                    Haz clic en la cámara para cambiar tu imagen y ajustar el
                    recorte.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalFotoOpen(true)}
                  className="rounded-2xl bg-[#22341c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
                >
                  Cambiar foto
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-[#faf9f5] p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 text-[#817d58]" size={16} />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Correo
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {form.email || "No definido"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 text-[#817d58]" size={16} />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Teléfono
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {form.telefono || "No definido"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPinned className="mt-0.5 text-[#817d58]" size={16} />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
                    Ciudad
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#22341c]">
                    {form.ciudad || "No definida"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <User className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Tipo de cuenta</p>
              <p className="mt-2 text-xl font-bold text-[#22341c]">
                {meta.rol || "Usuario"}
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <Heart className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Actividad</p>
              <p className="mt-2 text-xl font-bold text-[#22341c]">
                Comprador activo
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <MessageCircle className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Interacción</p>
              <p className="mt-2 text-xl font-bold text-[#22341c]">
                Conversaciones activas
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-[#817d58]/12 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                <Bell className="text-[#22341c]" size={20} />
              </div>
              <p className="text-sm text-[#817d58]">Seguimiento</p>
              <p className="mt-2 text-xl font-bold text-[#22341c]">
                Cuenta personal
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <form
            onSubmit={handleGuardar}
            className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#22341c]">
                Datos del perfil
              </h2>
              <p className="mt-1 text-sm text-[#817d58]">
                Mantén actualizada tu información principal para una mejor
                comunicación dentro de la plataforma.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#22341c]">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fetchProfile}
                className="rounded-2xl border border-[#817d58]/18 px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1]"
              >
                Restaurar
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
              >
                <Save size={16} />
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                  <Bell className="text-[#22341c]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#22341c]">
                    Preferencias rápidas
                  </h3>
                  <p className="text-sm text-[#817d58]">
                    Espacio preparado para futuras configuraciones personales.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#22341c]">
                      Alertas por correo
                    </p>
                    <p className="text-xs text-[#817d58]">
                      Próximamente configurable
                    </p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[#d8d3c4]" />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#faf9f5] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#22341c]">
                      Avisos de conversaciones
                    </p>
                    <p className="text-xs text-[#817d58]">
                      Próximamente configurable
                    </p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[#d8d3c4]" />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15">
                  <KeyRound className="text-[#22341c]" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#22341c]">Seguridad</h3>
                  <p className="text-sm text-[#817d58]">
                    Administra el acceso y la protección de tu cuenta.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setModalPassword(true)}
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#faf9f5] px-4 py-3 text-left text-sm font-medium text-[#22341c] transition hover:bg-[#f2efe6]"
                >
                  Cambiar contraseña
                </button>

                <ChangePasswordModal
                  open={modalPassword}
                  onClose={() => setModalPassword(false)}
                />

                <button
                  type="button"
                  className="w-full rounded-2xl border border-[#817d58]/18 bg-[#faf9f5] px-4 py-3 text-left text-sm font-medium text-[#22341c] transition hover:bg-[#f2efe6]"
                >
                  Revisar actividad de cuenta
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <ProfileImageModal
        isOpen={modalFotoOpen}
        onClose={() => {
          if (!subiendoFoto) setModalFotoOpen(false);
        }}
        onSave={handleSaveProfileImage}
      />
    </main>
  );
}