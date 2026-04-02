"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCog,
  LandPlot,
  Clock3,
  CreditCard,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

interface ResumenDashboard {
  usuariosTotales: number;
  colaboradores: number;
  terrenosActivos: number;
  pendientesAprobacion: number;
  suscripcionesActivas: number;
  suscripcionesPorVencer: number;
}

interface PublicacionReciente {
  id: number;
  titulo: string;
  estado: string;
  creado_en: string;
  nombre: string;
  apellido?: string | null;
}

export default function AdminDashboard() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [publicacionesRecientes, setPublicacionesRecientes] = useState<PublicacionReciente[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let activo = true;

    const cargarDashboard = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`${apiUrl}/api/admin/dashboard`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!activo) return;

        if (!res.ok) {
          setError(data?.message || "No fue posible cargar el dashboard.");
          return;
        }

        setResumen(data.resumen || null);
        setPublicacionesRecientes(Array.isArray(data.publicacionesRecientes) ? data.publicacionesRecientes : []);
      } catch (err) {
        console.error("Error cargando dashboard admin:", err);
        if (!activo) return;
        setError("Ocurrió un error cargando el dashboard.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDashboard();

    return () => {
      activo = false;
    };
  }, [apiUrl]);

  const cards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Usuarios totales",
        value: resumen.usuariosTotales,
        icon: <Users className="h-5 w-5" />,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        title: "Colaboradores",
        value: resumen.colaboradores,
        icon: <UserCog className="h-5 w-5" />,
        tone: "bg-indigo-50 text-indigo-700",
      },
      {
        title: "Terrenos activos",
        value: resumen.terrenosActivos,
        icon: <LandPlot className="h-5 w-5" />,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        title: "Pendientes aprobación",
        value: resumen.pendientesAprobacion,
        icon: <Clock3 className="h-5 w-5" />,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        title: "Suscripciones activas",
        value: resumen.suscripcionesActivas,
        icon: <CreditCard className="h-5 w-5" />,
        tone: "bg-cyan-50 text-cyan-700",
      },
      {
        title: "Por vencer (30 días)",
        value: resumen.suscripcionesPorVencer,
        icon: <CalendarClock className="h-5 w-5" />,
        tone: "bg-rose-50 text-rose-700",
      },
    ];
  }, [resumen]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return "bg-emerald-50 text-emerald-700";
      case "pendiente":
        return "bg-amber-50 text-amber-700";
      case "rechazado":
        return "bg-rose-50 text-rose-700";
      case "pausado":
        return "bg-slate-100 text-slate-700";
      case "eliminado":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Panel administrativo
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-800">
          Dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Resumen general del comportamiento operativo de SoloTerrenos.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {cargando ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando métricas del dashboard...
        </div>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-bold text-slate-800">
                      {card.value}
                    </p>
                  </div>

                  <div className={`rounded-2xl p-3 ${card.tone}`}>
                    {card.icon}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Publicaciones recientes
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Últimos terrenos registrados o modificados dentro del sistema.
                  </p>
                </div>

                <Link
                  href="/admin/publicaciones"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Ver módulo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {publicacionesRecientes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No hay publicaciones recientes para mostrar.
                </div>
              ) : (
                <div className="space-y-3">
                  {publicacionesRecientes.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.titulo}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.nombre} {item.apellido || ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                            item.estado
                          )}`}
                        >
                          {item.estado}
                        </span>

                        <span className="text-sm text-slate-500">
                          {new Date(item.creado_en).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">
                  Accesos rápidos
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Enlaces prioritarios para administración diaria.
                </p>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="/admin/publicaciones/pendientes"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Revisar pendientes de aprobación
                  </Link>

                  <Link
                    href="/admin/suscripciones"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Gestionar suscripciones
                  </Link>

                  <Link
                    href="/admin/users/colaboradores"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver colaboradores
                  </Link>

                  <Link
                    href="/admin/publicaciones/borrados"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Revisar borrados
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">
                  Lectura rápida
                </h3>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Usuarios:</span>{" "}
                    {resumen?.usuariosTotales ?? 0} registrados en la plataforma.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Operación:</span>{" "}
                    {resumen?.terrenosActivos ?? 0} terrenos aprobados visibles.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Suscripciones:</span>{" "}
                    {resumen?.suscripcionesActivas ?? 0} activas y{" "}
                    {resumen?.suscripcionesPorVencer ?? 0} cercanas a vencimiento.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}