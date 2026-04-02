"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AsignarSuscripcionModal from "../admin/asignarSuscripcionModal";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Layers3,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface SuscripcionActual {
  id: number;
  estado: string;
  origen?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  plan_codigo?: string | null;
  plan_nombre?: string | null;
  precio_mensual?: number | null;
  precio_anual?: number | null;
  plan_limite_terrenos?: number | null;
  permite_destacados?: boolean | null;
  stripe_checkout_session_id?: string | null;
}

interface Plan {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  precio_mensual?: number | null;
  precio_anual?: number | null;
  limite_terrenos?: number | null;
  permite_destacados?: boolean;
  activo: boolean;
}

export default function SuscripcionesClient() {
  const [cargando, setCargando] = useState(true);
  const [suscripcion, setSuscripcion] = useState<SuscripcionActual | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const [openModal, setOpenModal] = useState(false);

  const bloqueo = searchParams.get("bloqueo");
  const motivoBloqueo = searchParams.get("motivo");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        setCargando(true);
        setError("");

        const [suscripcionRes, planesRes] = await Promise.all([
          fetch(`${apiUrl}/api/suscripciones/me`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${apiUrl}/api/suscripciones/planes`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        const planesData = await planesRes.json();
        const suscripcionData = await suscripcionRes.json();

        if (!activo) return;

        if (planesRes.ok) {
          setPlanes(Array.isArray(planesData) ? planesData : []);
        }

        if (suscripcionRes.ok) {
          setSuscripcion(suscripcionData);
        } else {
          setSuscripcion(null);
          if (suscripcionRes.status !== 404) {
            setError(
              suscripcionData?.message ||
                "No fue posible obtener tu información de suscripción."
            );
          }
        }
      } catch (err) {
        console.error("Error cargando suscripciones:", err);
        if (!activo) return;
        setError("Ocurrió un error cargando tu información de suscripción.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [apiUrl]);

  const estadoLabel = useMemo(() => {
    const estado = suscripcion?.estado?.toLowerCase() || "";
    switch (estado) {
      case "activa":
        return "Activa";
      case "trialing":
        return "Prueba activa";
      case "cancelada":
        return "Cancelada";
      case "vencida":
        return "Vencida";
      case "pago_pendiente":
        return "Pago pendiente";
      case "suspendida":
        return "Suspendida";
      case "pausada":
        return "Pausada";
      default:
        return suscripcion?.estado || "Sin suscripción";
    }
  }, [suscripcion?.estado]);

  const estadoClasses = useMemo(() => {
    const estado = suscripcion?.estado?.toLowerCase() || "";
    switch (estado) {
      case "activa":
      case "trialing":
        return "bg-[#dcebd6] text-[#22341c]";
      case "pago_pendiente":
        return "bg-[#f4e7ca] text-[#6e5821]";
      case "cancelada":
      case "vencida":
      case "suspendida":
        return "bg-[#f1dada] text-[#7a3d3d]";
      default:
        return "bg-[#eceee3] text-[#4f583f]";
    }
  }, [suscripcion?.estado]);

  const fechaInicio = useMemo(() => {
    if (!suscripcion?.fecha_inicio) return "No disponible";
    return new Date(suscripcion.fecha_inicio).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [suscripcion?.fecha_inicio]);

  const fechaFin = useMemo(() => {
    if (!suscripcion?.fecha_fin) return "No disponible";
    return new Date(suscripcion.fecha_fin).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [suscripcion?.fecha_fin]);

  const formatearPrecio = (precio?: number | null) => {
    if (precio === null || precio === undefined) return "No disponible";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6f5ef] via-white to-[#f3f1e8] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#828d4b]">
            Suscripciones
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#22341c] md:text-4xl">
            Mi suscripción
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f684f] md:text-base">
            Consulta el estado actual de tu membresía, su vigencia y los planes disponibles
            dentro de SoloTerrenos.
          </p>
        </div>

        {bloqueo ? (
          <div className="mb-6 rounded-2xl border border-[#ead5d5] bg-[#fff6f6] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#7a3d3d]" />
              <div>
                <p className="text-sm font-semibold text-[#7a3d3d]">
                  Publicación bloqueada
                </p>
                <p className="mt-1 text-sm text-[#7a3d3d]">
                  {motivoBloqueo || "Tu cuenta no puede publicar terrenos en este momento."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-[#ead5d5] bg-[#fff6f6] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#7a3d3d]" />
              <p className="text-sm text-[#7a3d3d]">{error}</p>
            </div>
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#828d4b]" />
              <h2 className="text-xl font-semibold text-[#22341c]">
                Estado actual
              </h2>
            </div>

            {cargando ? (
              <div className="rounded-2xl border border-dashed border-[#d6d7c8] bg-[#fafaf6] p-5 text-sm text-[#5f684f]">
                Cargando información de tu suscripción...
              </div>
            ) : suscripcion ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#d9dccd] bg-[#fafaf6] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${estadoClasses}`}>
                      {estadoLabel}
                    </span>

                    {suscripcion.plan_nombre ? (
                      <span className="text-sm text-[#4e573d]">
                        Plan actual: <strong>{suscripcion.plan_nombre}</strong>
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Código del plan
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#22341c]">
                        {suscripcion.plan_codigo || "No disponible"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Origen
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-[#22341c]">
                        {suscripcion.origen || "No disponible"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Inicio
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#22341c]">
                        {fechaInicio}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Vigencia hasta
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#22341c]">
                        {fechaFin}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#d9dccd] bg-white p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Layers3 className="h-4 w-4 text-[#828d4b]" />
                      <p className="text-sm font-semibold text-[#22341c]">
                        Límite de terrenos
                      </p>
                    </div>
                    <p className="text-sm text-[#4e573d]">
                      {suscripcion.plan_limite_terrenos === null ||
                      suscripcion.plan_limite_terrenos === undefined
                        ? "Ilimitado"
                        : `${suscripcion.plan_limite_terrenos} publicaciones`}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d9dccd] bg-white p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-[#828d4b]" />
                      <p className="text-sm font-semibold text-[#22341c]">
                        Destacados
                      </p>
                    </div>
                    <p className="text-sm text-[#4e573d]">
                      {suscripcion.permite_destacados ? "Incluidos" : "No incluidos"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#eadfca] bg-[#fffaf1] p-5">
                <p className="text-sm font-medium text-[#5e5335]">
                  No tienes una suscripción activa registrada en este momento.
                </p>
                <p className="mt-2 text-sm text-[#6d654f]">
                  Puedes revisar los planes disponibles y contratar el que mejor se adapte a
                  tu operación.
                </p>

                <div className="mt-4">
                  <Link
                    href="/planes"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Ver planes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[#828d4b]" />
              <h2 className="text-xl font-semibold text-[#22341c]">
                Planes disponibles
              </h2>
            </div>

            {cargando ? (
              <div className="rounded-2xl border border-dashed border-[#d6d7c8] bg-[#fafaf6] p-5 text-sm text-[#5f684f]">
                Cargando catálogo de planes...
              </div>
            ) : (
              <div className="space-y-4">
                {planes.map((plan) => {
                  const actual = suscripcion?.plan_codigo === plan.codigo;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl border p-5 transition ${
                        actual
                          ? "border-[#c8d7c1] bg-[#f6fbf3]"
                          : "border-[#d9dccd] bg-[#fafaf6]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#22341c]">
                              {plan.nombre}
                            </h3>
                            {actual ? (
                              <span className="rounded-full bg-[#dcebd6] px-3 py-1 text-xs font-semibold text-[#22341c]">
                                Actual
                              </span>
                            ) : null}
                          </div>

                          {plan.descripcion ? (
                            <p className="mt-2 text-sm leading-6 text-[#5f684f]">
                              {plan.descripcion}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-[#7c8666]">Mensual</p>
                          <p className="text-lg font-bold text-[#22341c]">
                            {formatearPrecio(plan.precio_mensual)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                            Límite
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#22341c]">
                            {plan.limite_terrenos === null || plan.limite_terrenos === undefined
                              ? "Ilimitado"
                              : `${plan.limite_terrenos} terrenos`}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                            Anual
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#22341c]">
                            {formatearPrecio(plan.precio_anual)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                            Destacados
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#22341c]">
                            {plan.permite_destacados ? "Sí" : "No"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {!actual ? (
                          <Link
                            href="/planes"
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#cfd4bf] px-4 py-2 text-sm font-semibold text-[#22341c] transition hover:bg-white"
                          >
                            Ver plan
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#4e573d]">
                            Este es tu plan actual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/publicar"
            className="rounded-2xl border border-[#d9dccd] bg-white p-5 shadow-sm transition hover:bg-[#fafaf6]"
          >
            <div className="mb-3 flex items-center gap-2 text-[#22341c]">
              <ArrowRight className="h-4 w-4" />
              <p className="font-semibold">Ir a publicar</p>
            </div>
            <p className="text-sm leading-6 text-[#5f684f]">
              Continúa con la carga de terrenos usando tu cuenta actual.
            </p>
          </Link>

          <Link
            href="/planes"
            className="rounded-2xl border border-[#d9dccd] bg-white p-5 shadow-sm transition hover:bg-[#fafaf6]"
          >
            <div className="mb-3 flex items-center gap-2 text-[#22341c]">
              <CalendarClock className="h-4 w-4" />
              <p className="font-semibold">Ver todos los planes</p>
            </div>
            <p className="text-sm leading-6 text-[#5f684f]">
              Revisa tu estrategia de crecimiento y compara opciones disponibles.
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-[#d9dccd] bg-white p-5 shadow-sm transition hover:bg-[#fafaf6]"
          >
            <div className="mb-3 flex items-center gap-2 text-[#22341c]">
              <ShieldCheck className="h-4 w-4" />
              <p className="font-semibold">Volver al inicio</p>
            </div>
            <p className="text-sm leading-6 text-[#5f684f]">
              Regresa a la página principal y sigue navegando por SoloTerrenos.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}