"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  terrenoId: number;
  nombreInicial?: string;
  emailInicial?: string;
  telefonoInicial?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ContactarVendedorModal({
  open,
  onClose,
  terrenoId,
  nombreInicial = "",
  emailInicial = "",
  telefonoInicial = "",
}: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState(
    "Hola, me interesa este terreno. ¿Podrían brindarme más información?"
  );
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open) return;

    setNombre(nombreInicial || "");
    setEmail(emailInicial || "");
    setTelefono(telefonoInicial || "");
  }, [open, nombreInicial, emailInicial, telefonoInicial]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !enviando) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, enviando, onClose]);

  const cerrar = () => {
    if (enviando) return;
    onClose();
  };

  const enviarLead = async () => {
    if (!nombre.trim() || !email.trim()) {
      toast.error("Completa los campos obligatorios.", {
        description: "Nombre y correo son necesarios para enviar tu solicitud.",
      });
      return;
    }

    try {
      setEnviando(true);

      const response = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terreno_id: terrenoId,
          nombre_contacto: nombre.trim(),
          email_contacto: email.trim(),
          telefono_contacto: telefono.trim(),
          mensaje: mensaje.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo enviar tu solicitud.", {
          description: data.message || "Inténtalo nuevamente en unos momentos.",
        });
        return;
      }

      toast.success("Solicitud enviada correctamente.", {
        description: "El vendedor recibió tu interés y podrá ponerse en contacto contigo.",
      });

      onClose();
    } catch (error) {
      console.error("Error enviando lead:", error);
      toast.error("Ocurrió un error al enviar tu solicitud.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={cerrar}
      />

      <div
        className="relative z-[121] w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#817d58]/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#817d58]/12 px-6 py-5 md:px-8">
          <div>
            <h3 className="text-2xl font-semibold text-[#22341c]">
              Contactar vendedor
            </h3>
            <p className="mt-1 text-sm text-[#817d58]">
              Comparte tus datos para solicitar información sobre este terreno.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            disabled={enviando}
            className="ml-4 flex h-10 w-10 items-center justify-center rounded-full text-[#817d58] transition hover:bg-[#f7f6f1] hover:text-[#22341c] disabled:opacity-60"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6 md:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#22341c]">
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/40"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#22341c]">
                Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/40"
                placeholder="Tu número"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#22341c]">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/40"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#22341c]">
              Mensaje
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/40"
              placeholder="Escribe tu mensaje"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#817d58]/12 px-6 py-5 md:flex-row md:justify-end md:px-8">
          <button
            type="button"
            onClick={cerrar}
            disabled={enviando}
            className="rounded-2xl border border-[#817d58]/20 px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f7f6f1] disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={enviarLead}
            disabled={enviando}
            className="rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}