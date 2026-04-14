"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface Suscripcion {
  id: number;
  estado: string;
  plan_codigo?: string | null;
  plan_nombre?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  origen?: string | null;
  stripe_checkout_session_id?: string | null;
}

interface ExitoClientProps {
  sessionId: string;
}

export default function ExitoClient({ sessionId }: ExitoClientProps) {
  const [cargando, setCargando] = useState(true);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [error, setError] = useState<string>("");
  const [sesionRefrescada, setSesionRefrescada] = useState(false);

  const refrescoEjecutadoRef = useRef(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let activo = true;

    const consultarSuscripcion = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`${API_URL}/api/suscripciones/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!activo) return;

        if (!res.ok) {
          setError(
            data?.message || "No fue posible validar tu suscripción todavía."
          );
          setSuscripcion(null);
          return;
        }

        setSuscripcion(data);
      } catch (err) {
        console.error("Error consultando suscripción:", err);
        if (!activo) return;
        setError("Ocurrió un error consultando el estado de tu suscripción.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    consultarSuscripcion();

    const intervalo = setInterval(() => {
      consultarSuscripcion();
    }, 4000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [API_URL]);

  const estadoNormalizado = useMemo(() => {
    return suscripcion?.estado?.toLowerCase() || "";
  }, [suscripcion]);

  const activada =
    estadoNormalizado === "activa" || estadoNormalizado === "trialing";

  useEffect(() => {
    if (!activada) return;
    if (refrescoEjecutadoRef.current) return;

    const refrescarSesion = async () => {
      try {
        refrescoEjecutadoRef.current = true;

        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          console.error(
            "No se pudo refrescar la sesión:",
            data?.message || res.status
          );
          return;
        }

        setSesionRefrescada(true);
      } catch (error) {
        console.error("Error refrescando sesión:", error);
      }
    };

    refrescarSesion();
  }, [activada, API_URL]);

  const fechaFinFormateada = useMemo(() => {
    if (!suscripcion?.fecha_fin) return "Sin fecha disponible";
    const fecha = new Date(suscripcion.fecha_fin);
    return fecha.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [suscripcion?.fecha_fin]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6f5ef] via-white to-[#f3f1e8] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7efe3] shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-[#22341c]" />
          </div>

          <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
            Pago procesado correctamente
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5f684f] md:text-base">
            Tu operación en Stripe fue completada. Ahora estamos validando tu
            suscripción dentro de SoloTerrenos para habilitar tus permisos de
            publicación.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#828d4b]" />
              <h2 className="text-xl font-semibold text-[#22341c]">
                Estado de activación
              </h2>
            </div>

            {cargando ? (
              <div className="rounded-2xl border border-dashed border-[#d6d7c8] bg-[#fafaf6] p-5">
                <div className="flex items-center gap-3 text-[#5f684f]">
                  <Clock3 className="h-5 w-5 animate-pulse" />
                  <p className="text-sm md:text-base">
                    Validando tu suscripción con el sistema. Esto puede tardar
                    unos segundos.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#ead5d5] bg-[#fff6f6] p-5">
                <p className="text-sm font-medium text-[#7a3d3d]">{error}</p>
                <p className="mt-2 text-sm text-[#8d6666]">
                  Si acabas de pagar, espera unos segundos y recarga esta página.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`rounded-2xl border p-5 ${
                    activada
                      ? "border-[#cfe0c7] bg-[#f6fbf3]"
                      : "border-[#eadfca] bg-[#fffaf1]"
                  }`}
                >
                  <p className="text-sm uppercase tracking-wide text-[#7c8666]">
                    Estado actual
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        activada
                          ? "bg-[#dcebd6] text-[#22341c]"
                          : "bg-[#f4e7ca] text-[#6e5821]"
                      }`}
                    >
                      {suscripcion?.estado || "pendiente"}
                    </span>

                    {suscripcion?.plan_nombre ? (
                      <span className="text-sm text-[#5f684f]">
                        Plan: <strong>{suscripcion.plan_nombre}</strong>
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Código del plan
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#22341c]">
                        {suscripcion?.plan_codigo || "No disponible"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                        Vigencia actual
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#22341c]">
                        {fechaFinFormateada}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d9dccd] bg-[#fafaf6] p-5">
                  <p className="text-sm leading-6 text-[#4e573d]">
                    {activada
                      ? "Tu suscripción ya está activa y tu cuenta puede operar como colaborador según la configuración aplicada."
                      : "Tu pago ya fue recibido, pero la activación todavía no aparece como finalizada. Mantén esta página abierta unos segundos o recárgala."}
                  </p>

                  {activada && sesionRefrescada && (
                    <p className="mt-3 text-sm font-medium text-[#22341c]">
                      Tu sesión fue actualizada correctamente con los nuevos permisos.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[#828d4b]" />
              <h2 className="text-xl font-semibold text-[#22341c]">
                Resumen
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#f7f8f2] p-4">
                <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                  Session ID
                </p>
                <p className="mt-2 break-all text-sm font-medium text-[#22341c]">
                  {sessionId || "No disponible"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f8f2] p-4">
                <p className="text-xs uppercase tracking-wide text-[#7c8666]">
                  Origen
                </p>
                <p className="mt-2 text-sm font-medium text-[#22341c]">
                  {suscripcion?.origen || "Pendiente de sincronización"}
                </p>
              </div>

              <div className="pt-2">
                <div className="grid gap-3">
                  <Link
                    href="/publicar"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Ir a publicar
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/suscripciones"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#cfd4bf] px-5 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f7f8f2]"
                  >
                    Ver mi suscripción
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold text-[#5f684f] transition hover:bg-[#f7f8f2]"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}