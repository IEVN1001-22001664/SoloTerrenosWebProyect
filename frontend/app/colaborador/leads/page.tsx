"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Search, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

interface Lead {
  lead_id: number;
  terreno_id: number;
  comprador_id: number;
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto?: string;
  mensaje?: string;
  estado: string;
  creado_en: string;
  terreno_titulo: string;
  terreno_precio: string;
  municipio?: string;
  estado_region?: string;
  imagen_principal?: string;
  conversacion_id?: number;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ColaboradorLeadsPage() {
  const { user, loading } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchLeads();
  }, [loading, user]);

  const fetchLeads = async () => {
    try {
      setCargando(true);

      const response = await fetch(`${API_URL}/api/leads/mis-leads`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron cargar los leads.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        setLeads([]);
        return;
      }

      setLeads(data);
    } catch (error) {
      console.error("Error cargando leads:", error);
      toast.error("Error al cargar leads.", {
        description: "Verifica tu conexión e inténtalo nuevamente.",
      });
      setLeads([]);
    } finally {
      setCargando(false);
    }
  };

  const leadsFiltrados = useMemo(() => {
    let resultado = [...leads];

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((lead) => {
        const nombre = (lead.nombre_contacto || "").toLowerCase();
        const correo = (lead.email_contacto || "").toLowerCase();
        const terreno = (lead.terreno_titulo || "").toLowerCase();
        const municipio = (lead.municipio || "").toLowerCase();
        const estadoRegion = (lead.estado_region || "").toLowerCase();
        const mensaje = (lead.mensaje || "").toLowerCase();

        return (
          nombre.includes(texto) ||
          correo.includes(texto) ||
          terreno.includes(texto) ||
          municipio.includes(texto) ||
          estadoRegion.includes(texto) ||
          mensaje.includes(texto)
        );
      });
    }

    if (filtroEstado !== "todos") {
      resultado = resultado.filter(
        (lead) => (lead.estado || "").toLowerCase() === filtroEstado
      );
    }

    return resultado;
  }, [leads, busqueda, filtroEstado]);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getImageUrl = (img?: string) => {
    if (!img) return "/images/terreno-placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* encabezado */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#22341c]">Leads recibidos</h1>
            <p className="mt-1 text-sm text-[#817d58]">
              Gestiona los interesados en tus publicaciones.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm border border-[#817d58]/12">
            <p className="text-xs uppercase tracking-[0.14em] text-[#817d58]">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-[#22341c]">
              {leads.length}
            </p>
          </div>
        </div>

        {/* filtros */}
        <div className="mb-8 grid gap-4 rounded-[1.8rem] border border-[#817d58]/12 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_220px]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7f6f1] px-4 py-3">
            <Search size={18} className="text-[#817d58]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, terreno o mensaje..."
              className="w-full bg-transparent text-sm text-[#22341c] outline-none placeholder:text-[#817d58]"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-2xl border border-[#817d58]/15 bg-[#f7f6f1] px-4 py-3 text-sm text-[#22341c] outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="cerrado">Cerrado</option>
            <option value="descartado">Descartado</option>
          </select>
        </div>

        {/* contenido */}
        {cargando ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando leads...
          </div>
        ) : leadsFiltrados.length === 0 ? (
          <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#22341c]">
              No hay leads disponibles
            </h2>
            <p className="mt-2 text-sm text-[#817d58]">
              Cuando un usuario contacte por uno de tus terrenos, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {leadsFiltrados.map((lead) => (
              <article
                key={lead.lead_id}
                className="overflow-hidden rounded-[1.8rem] border border-[#817d58]/12 bg-white shadow-sm"
              >
                <div className="grid md:grid-cols-[180px_1fr]">
                  {/* imagen */}
                  <div className="relative h-52 md:h-full">
                    <img
                      src={getImageUrl(lead.imagen_principal)}
                      alt={lead.terreno_titulo}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* contenido */}
                  <div className="p-5 md:p-6">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="line-clamp-1 text-lg font-semibold text-[#22341c]">
                          {lead.terreno_titulo}
                        </h2>

                        <p className="mt-1 flex items-center gap-1 text-sm text-[#817d58]">
                          <MapPin size={14} />
                          {[lead.municipio, lead.estado_region]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#828d4b]/15 px-3 py-1 text-xs font-medium text-[#22341c]">
                        {lead.estado}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#f7f6f1] p-4">
                      <p className="text-sm font-semibold text-[#22341c]">
                        {lead.nombre_contacto}
                      </p>

                      <div className="mt-2 space-y-2 text-sm text-[#817d58]">
                        <p className="flex items-center gap-2">
                          <Mail size={14} />
                          {lead.email_contacto}
                        </p>

                        {lead.telefono_contacto && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {lead.telefono_contacto}
                          </p>
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[#4f4a3d]">
                        {lead.mensaje || "Sin mensaje inicial."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-xs text-[#817d58]">
                        Recibido el {formatFecha(lead.creado_en)}
                      </p>

                      {Number(lead.conversacion_id) > 0 ? (
                        <Link
                            href={`/colaborador/mensajes?conversacion=${lead.conversacion_id}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#22341c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
                        >
                            <MessageCircle size={16} />
                            Abrir chat
                        </Link>
                        ) : (
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-[#817d58]/15 px-4 py-2.5 text-sm text-[#817d58]">
                            Chat no disponible
                        </span>
                        )}
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