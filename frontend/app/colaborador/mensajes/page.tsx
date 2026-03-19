"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Search, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";


interface Conversacion {
  conversacion_id: number;
  lead_id: number;
  terreno_id: number;
  comprador_id: number;
  vendedor_id: number;
  estado: string;
  creado_en: string;
  actualizado_en: string;
  ultimo_mensaje_en: string;
  terreno_titulo: string;
  terreno_precio: string;
  municipio?: string;
  estado_region?: string;
  imagen_principal?: string;
  contacto_id: number;
  contacto_nombre: string;
  contacto_apellido?: string;
  contacto_email?: string;
  ultimo_mensaje?: string;
  no_leidos?: string | number;
}

interface Mensaje {
  id: number;
  conversacion_id: number;
  remitente_id: number;
  contenido: string;
  leido: boolean;
  creado_en: string;
  nombre: string;
  apellido?: string;
}

export default function ColaboradorMensajesPage() {
  const { user, loading } = useAuth();

  const searchParams = useSearchParams();
  const conversacionQuery = searchParams.get("conversacion");
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajeNuevo, setMensajeNuevo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargandoConversaciones, setCargandoConversaciones] = useState(true);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchConversaciones();
  }, [loading, user, conversacionQuery]);

  const fetchConversaciones = async () => {
    try {
      setCargandoConversaciones(true);

      const response = await fetch("http://localhost:5000/api/conversaciones/mias", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron cargar las conversaciones.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        setConversaciones([]);
        return;
      }

      setConversaciones(data);

      if (data.length > 0) {
        if (conversacionQuery) {
            const conversacionBuscada = data.find(
            (conv: Conversacion) =>
                Number(conv.conversacion_id) === Number(conversacionQuery)
            );

            if (conversacionBuscada) {
            setConversacionActiva(conversacionBuscada);
            return;
            }
        }

        if (!conversacionActiva) {
            setConversacionActiva(data[0]);
        }
        }
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      toast.error("Error al cargar conversaciones.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setCargandoConversaciones(false);
    }
  };

  useEffect(() => {
    if (!conversacionActiva) return;
    fetchMensajes(conversacionActiva.conversacion_id);
  }, [conversacionActiva]);

  const fetchMensajes = async (conversacionId: number) => {
    try {
      setCargandoMensajes(true);

      const response = await fetch(
        `http://localhost:5000/api/conversaciones/${conversacionId}/mensajes`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron cargar los mensajes.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        setMensajes([]);
        return;
      }

      setMensajes(data.mensajes || []);

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.conversacion_id === conversacionId
            ? { ...conv, no_leidos: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      toast.error("Error al cargar mensajes.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setCargandoMensajes(false);
    }
  };

  const enviarMensaje = async () => {
    if (!conversacionActiva) return;
    if (!mensajeNuevo.trim()) return;

    try {
      setEnviando(true);

      const response = await fetch(
        `http://localhost:5000/api/conversaciones/${conversacionActiva.conversacion_id}/mensajes`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contenido: mensajeNuevo.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo enviar el mensaje.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      setMensajeNuevo("");
      await fetchMensajes(conversacionActiva.conversacion_id);
      await fetchConversaciones();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error("Error al enviar mensaje.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const conversacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return conversaciones;

    return conversaciones.filter((conv) => {
      const nombre = `${conv.contacto_nombre || ""} ${conv.contacto_apellido || ""}`.toLowerCase();
      const terreno = (conv.terreno_titulo || "").toLowerCase();
      const municipio = (conv.municipio || "").toLowerCase();
      const estadoRegion = (conv.estado_region || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        terreno.includes(texto) ||
        municipio.includes(texto) ||
        estadoRegion.includes(texto)
      );
    });
  }, [conversaciones, busqueda]);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getImageUrl = (img?: string) => {
    if (!img) return "/images/terreno-placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `http://localhost:5000${img}`;
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#22341c]">Mensajes</h1>
          <p className="mt-1 text-sm text-[#817d58]">
            Gestiona las conversaciones con interesados en tus terrenos.
          </p>
        </div>

        <div className="grid min-h-[78vh] overflow-hidden rounded-[2rem] border border-[#817d58]/15 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
          {/* Sidebar conversaciones */}
          <aside className="border-b border-[#817d58]/12 lg:border-b-0 lg:border-r">
            <div className="border-b border-[#817d58]/12 p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f7f6f1] px-4 py-3">
                <Search size={18} className="text-[#817d58]" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]"
                />
              </div>
            </div>

            <div className="max-h-[78vh] overflow-y-auto">
              {cargandoConversaciones ? (
                <div className="p-6 text-sm text-[#817d58]">
                  Cargando conversaciones...
                </div>
              ) : conversacionesFiltradas.length === 0 ? (
                <div className="p-6 text-sm text-[#817d58]">
                  No hay conversaciones disponibles.
                </div>
              ) : (
                conversacionesFiltradas.map((conv) => {
                  const activa =
                    conversacionActiva?.conversacion_id === conv.conversacion_id;

                  return (
                    <button
                      key={conv.conversacion_id}
                      type="button"
                      onClick={() => setConversacionActiva(conv)}
                      className={`w-full border-b border-[#817d58]/10 px-4 py-4 text-left transition ${
                        activa ? "bg-[#f3f2ea]" : "hover:bg-[#faf9f5]"
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={getImageUrl(conv.imagen_principal)}
                          alt={conv.terreno_titulo}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 font-semibold text-[#22341c]">
                              {conv.contacto_nombre} {conv.contacto_apellido || ""}
                            </p>

                            {Number(conv.no_leidos || 0) > 0 && (
                              <span className="rounded-full bg-[#828d4b] px-2 py-0.5 text-xs font-semibold text-white">
                                {conv.no_leidos}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-[#817d58]">
                            {conv.terreno_titulo}
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs text-[#9f885c]">
                            {conv.ultimo_mensaje || "Sin mensajes"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Panel chat */}
          <section className="flex min-h-[78vh] flex-col">
            {conversacionActiva ? (
              <>
                <div className="border-b border-[#817d58]/12 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(conversacionActiva.imagen_principal)}
                      alt={conversacionActiva.terreno_titulo}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />

                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-lg font-semibold text-[#22341c]">
                        {conversacionActiva.contacto_nombre}{" "}
                        {conversacionActiva.contacto_apellido || ""}
                      </h2>

                      <p className="line-clamp-1 text-sm text-[#817d58]">
                        {conversacionActiva.terreno_titulo}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-[#9f885c]">
                        <MapPin size={12} />
                        {[conversacionActiva.municipio, conversacionActiva.estado_region]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfbf8] px-5 py-5">
                  {cargandoMensajes ? (
                    <p className="text-sm text-[#817d58]">Cargando mensajes...</p>
                  ) : mensajes.length === 0 ? (
                    <p className="text-sm text-[#817d58]">
                      Aún no hay mensajes en esta conversación.
                    </p>
                  ) : (
                    mensajes.map((msg) => {
                      const propio = msg.remitente_id === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${propio ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 shadow-sm ${
                              propio
                                ? "bg-[#22341c] text-white"
                                : "bg-white text-[#22341c] border border-[#817d58]/12"
                            }`}
                          >
                            <p className="whitespace-pre-line text-sm leading-6">
                              {msg.contenido}
                            </p>
                            <p
                              className={`mt-2 text-[11px] ${
                                propio ? "text-white/70" : "text-[#817d58]"
                              }`}
                            >
                              {formatFecha(msg.creado_en)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-[#817d58]/12 bg-white p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={mensajeNuevo}
                      onChange={(e) => setMensajeNuevo(e.target.value)}
                      rows={2}
                      placeholder="Escribe un mensaje..."
                      className="min-h-[56px] flex-1 resize-none rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                    />

                    <button
                      type="button"
                      onClick={enviarMensaje}
                      disabled={enviando || !mensajeNuevo.trim()}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22341c] text-white transition hover:bg-[#828d4b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div>
                  <h2 className="text-xl font-semibold text-[#22341c]">
                    Selecciona una conversación
                  </h2>
                  <p className="mt-2 text-sm text-[#817d58]">
                    Aquí podrás revisar y responder los mensajes de tus leads.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}