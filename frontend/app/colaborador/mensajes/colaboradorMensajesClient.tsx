"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Search, MapPin, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getSocket } from "@/src/lib/socket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
  temporal?: boolean;
  error?: boolean;
}


export default function ColaboradorMensajesPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const conversacionQuery = searchParams.get("conversacion");
  const mensajesEndRef = useRef<HTMLDivElement | null>(null);
  const justSentMessageRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] =
    useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajeNuevo, setMensajeNuevo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargandoConversaciones, setCargandoConversaciones] = useState(true);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    mensajesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchConversaciones();
  }, [loading, user, conversacionQuery]);

  useEffect(() => {
    if (!conversacionActiva) return;
    fetchMensajes(conversacionActiva.conversacion_id);
  }, [conversacionActiva]);

  useEffect(() => {
    if (!conversacionActiva) return;

    const timeout = setTimeout(() => {
      scrollToBottom("auto");
    }, 60);

    return () => clearTimeout(timeout);
  }, [conversacionActiva?.conversacion_id]);

  useEffect(() => {
    if (!mensajes.length) return;

    const timeout = setTimeout(() => {
      scrollToBottom(justSentMessageRef.current ? "smooth" : "auto");
      justSentMessageRef.current = false;
    }, 60);

    return () => clearTimeout(timeout);
  }, [mensajes]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleNuevoMensaje = (mensaje: Mensaje) => {
      const perteneceActiva =
        Number(mensaje.conversacion_id) ===
        Number(conversacionActiva?.conversacion_id);

      if (perteneceActiva) {
        setMensajes((prev) => {
          const sinTemporalesEquivalentes = prev.filter(
            (msg) =>
              !(
                msg.temporal &&
                msg.remitente_id === mensaje.remitente_id &&
                msg.contenido.trim() === mensaje.contenido.trim()
              )
          );

          const yaExiste = sinTemporalesEquivalentes.some(
            (msg) => Number(msg.id) === Number(mensaje.id)
          );

          if (yaExiste) return sinTemporalesEquivalentes;

          return [...sinTemporalesEquivalentes, mensaje];
        });
      }

      setConversaciones((prev) => {
        const actualizadas = prev.map((conv) => {
          if (
            Number(conv.conversacion_id) !== Number(mensaje.conversacion_id)
          ) {
            return conv;
          }

          const esActiva =
            Number(conv.conversacion_id) ===
            Number(conversacionActiva?.conversacion_id);

          return {
            ...conv,
            ultimo_mensaje: mensaje.contenido,
            ultimo_mensaje_en: mensaje.creado_en,
            no_leidos: esActiva ? 0 : Number(conv.no_leidos || 0) + 1,
          };
        });

        actualizadas.sort((a, b) => {
          const fechaA = a.ultimo_mensaje_en
            ? new Date(a.ultimo_mensaje_en).getTime()
            : 0;
          const fechaB = b.ultimo_mensaje_en
            ? new Date(b.ultimo_mensaje_en).getTime()
            : 0;

          return fechaB - fechaA;
        });

        return actualizadas;
      });
    };

    socket.on("nuevo_mensaje", handleNuevoMensaje);

    return () => {
      socket.off("nuevo_mensaje", handleNuevoMensaje);
    };
  }, [loading, user, conversacionActiva?.conversacion_id]);

  useEffect(() => {
    if (!conversacionActiva) return;

    const socket = getSocket();
    socket.emit("join_conversacion", conversacionActiva.conversacion_id);

    return () => {
      socket.emit("leave_conversacion", conversacionActiva.conversacion_id);
    };
  }, [conversacionActiva?.conversacion_id]);

  const fetchConversaciones = async () => {
    try {
      setCargandoConversaciones(true);

      const response = await fetch(`${API_URL}/api/conversaciones/mias`, {
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

      const lista = Array.isArray(data) ? data : [];

      if (lista.length > 0) {
        const conversacionDesdeUrl = conversacionQuery
          ? lista.find(
              (conv: Conversacion) =>
                String(conv.conversacion_id) === String(conversacionQuery)
            )
          : null;

        setConversaciones(lista);

        if (conversacionDesdeUrl) {
          setConversacionActiva(conversacionDesdeUrl);
        } else if (!conversacionActiva) {
          setConversacionActiva(lista[0]);
        }
      } else {
        setConversaciones([]);
        setConversacionActiva(null);
      }
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      toast.error("Error al cargar conversaciones.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
      setConversaciones([]);
    } finally {
      setCargandoConversaciones(false);
    }
  };

  const fetchMensajes = async (conversacionId: number) => {
    try {
      setCargandoMensajes(true);

      const response = await fetch(
        `${API_URL}/api/conversaciones/${conversacionId}/mensajes`,
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

    const contenido = mensajeNuevo.trim();
    const tempId = Date.now() * -1;

    const mensajeTemporal: Mensaje = {
      id: tempId,
      conversacion_id: conversacionActiva.conversacion_id,
      remitente_id: user?.id || 0,
      contenido,
      leido: true,
      creado_en: new Date().toISOString(),
      nombre: user?.nombre || "Tú",
      apellido: user?.apellido || "",
      temporal: true,
    };

    try {
      setEnviando(true);
      justSentMessageRef.current = true;

      setMensajes((prev) => [...prev, mensajeTemporal]);
      setMensajeNuevo("");

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.conversacion_id === conversacionActiva.conversacion_id
            ? {
                ...conv,
                ultimo_mensaje: contenido,
                ultimo_mensaje_en: new Date().toISOString(),
              }
            : conv
        )
      );

      const response = await fetch(
        `${API_URL}/api/conversaciones/${conversacionActiva.conversacion_id}/mensajes`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contenido,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, error: true, temporal: false } : msg
          )
        );

        toast.error("No se pudo enviar el mensaje.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      const mensajeServidor = data?.mensaje;

      if (mensajeServidor) {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...mensajeServidor,
                  temporal: false,
                  error: false,
                }
              : msg
          )
        );
      } else {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  temporal: false,
                  error: false,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);

      setMensajes((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, error: true, temporal: false } : msg
        )
      );

      toast.error("Error al enviar mensaje.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDownMensaje = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!mensajeNuevo.trim() || enviando) return;

      await enviarMensaje();
    }
  };

  const conversacionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return conversaciones;

    return conversaciones.filter((conv) => {
      const nombre =
        `${conv.contacto_nombre || ""} ${conv.contacto_apellido || ""}`.toLowerCase();
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
    return `${API_URL}${img}`;
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 md:mb-6">
          <h1 className="text-3xl font-bold text-[#22341c]">Mensajes</h1>
          <p className="mt-1 text-sm text-[#817d58]">
            Gestiona las conversaciones con interesados en tus terrenos.
          </p>
        </div>

        <div className="grid h-[calc(100vh-12.5rem)] min-h-[560px] overflow-hidden rounded-[2rem] border border-[#817d58]/15 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
          <aside
            className={`h-full min-h-0 flex-col border-b border-[#817d58]/12 lg:border-b-0 lg:border-r ${
              isMobile && conversacionActiva ? "hidden" : "flex"
            }`}
          >
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

            <div className="flex-1 overflow-y-auto">
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

          <section
            className={`h-full min-h-0 flex-col ${
              isMobile && !conversacionActiva ? "hidden" : "flex"
            }`}
          >
            {conversacionActiva ? (
              <>
                <div className="sticky top-0 z-10 border-b border-[#817d58]/12 bg-white px-4 py-4 md:px-5">
                  <div className="flex items-center gap-3 md:gap-4">
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setConversacionActiva(null)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#817d58]/15 text-[#22341c] transition hover:bg-[#f7f6f1]"
                        aria-label="Volver a conversaciones"
                      >
                        <ArrowLeft size={18} />
                      </button>
                    )}

                    <img
                      src={getImageUrl(conversacionActiva.imagen_principal)}
                      alt={conversacionActiva.terreno_titulo}
                      className="h-14 w-14 rounded-2xl object-cover md:h-16 md:w-16"
                    />

                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-base font-semibold text-[#22341c] md:text-lg">
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

                <div className="flex-1 min-h-0 overflow-y-auto bg-[#fcfbf8] px-4 py-4 md:px-5 md:py-5">
                  <div className="space-y-4">
                    {cargandoMensajes ? (
                      <p className="text-sm text-[#817d58]">Cargando mensajes...</p>
                    ) : mensajes.length === 0 ? (
                      <p className="text-sm text-[#817d58]">
                        Aún no hay mensajes en esta conversación.
                      </p>
                    ) : (
                      <>
                        {mensajes.map((msg) => {
                          const propio = msg.remitente_id === user?.id;

                          return (
                            <div
                              key={msg.id}
                              className={`flex transition-all duration-300 ${
                                propio ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 shadow-sm transition-all duration-300 md:max-w-[80%] ${
                                  propio
                                    ? msg.error
                                      ? "border border-red-200 bg-red-100 text-red-700"
                                      : msg.temporal
                                      ? "bg-[#22341c]/90 text-white"
                                      : "bg-[#22341c] text-white"
                                    : "border border-[#817d58]/12 bg-white text-[#22341c]"
                                }`}
                              >
                                <p className="whitespace-pre-line break-words text-sm leading-6">
                                  {msg.contenido}
                                </p>

                                {propio && msg.temporal && !msg.error && (
                                  <p className="mt-1 text-[11px] text-white/60">
                                    Enviando...
                                  </p>
                                )}

                                {propio && msg.error && (
                                  <p className="mt-1 text-[11px] text-red-600">
                                    No se pudo enviar
                                  </p>
                                )}

                                <p
                                  className={`mt-2 text-[11px] ${
                                    propio
                                      ? msg.error
                                        ? "text-red-500"
                                        : "text-white/70"
                                      : "text-[#817d58]"
                                  }`}
                                >
                                  {formatFecha(msg.creado_en)}
                                </p>
                              </div>
                            </div>
                          );
                        })}

                        <div ref={mensajesEndRef} />
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#817d58]/12 bg-white p-3 md:p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={mensajeNuevo}
                      onChange={(e) => setMensajeNuevo(e.target.value)}
                      onKeyDown={handleKeyDownMensaje}
                      rows={2}
                      placeholder="Escribe un mensaje..."
                      className="min-h-[56px] flex-1 resize-none rounded-2xl border border-[#817d58]/20 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
                    />

                    <button
                      type="button"
                      onClick={enviarMensaje}
                      disabled={enviando || !mensajeNuevo.trim()}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22341c] text-white transition hover:bg-[#828d4b] disabled:cursor-not-allowed disabled:opacity-60 md:h-14 md:w-14"
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