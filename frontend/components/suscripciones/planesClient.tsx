"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2, AlertCircle } from "lucide-react";

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

export default function PlanesClient() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [planCargando, setPlanCargando] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let activo = true;

    const cargarPlanes = async () => {
      try {
        setCargando(true);
        setError("");

        const res = await fetch(`${API_URL}/api/suscripciones/planes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!activo) return;

        if (!res.ok) {
          setError(data?.message || "No fue posible cargar los planes.");
          setPlanes([]);
          return;
        }

        setPlanes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando planes:", err);
        if (!activo) return;
        setError("Ocurrió un error al cargar los planes.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarPlanes();

    return () => {
      activo = false;
    };
  }, [API_URL]);

  const formatearPrecio = (precio?: number | null) => {
    if (precio === null || precio === undefined) return "No disponible";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const manejarSuscripcion = async (planCodigo: string) => {
    try {
      setPlanCargando(planCodigo);
      setError("");

      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_codigo: planCodigo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No fue posible iniciar el proceso de pago.");
        return;
      }

      if (!data?.url) {
        setError("Stripe no devolvió una URL de pago válida.");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error iniciando checkout:", err);
      setError("Ocurrió un error al iniciar el pago.");
    } finally {
      setPlanCargando(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6f5ef] via-white to-[#f3f1e8] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#828d4b]">
            Planes
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#22341c] md:text-5xl">
            Elige tu plan ideal
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-[#5f684f] md:text-base">
            Activa tu suscripción y convierte tu cuenta en una operación más sólida dentro de
            SoloTerrenos. Publica, administra y escala tus terrenos con mayor control.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[#ead5d5] bg-[#fff6f6] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#7a3d3d]" />
              <p className="text-sm text-[#7a3d3d]">{error}</p>
            </div>
          </div>
        ) : null}

        {cargando ? (
          <div className="rounded-3xl border border-dashed border-[#d6d7c8] bg-[#fafaf6] p-8 text-center text-sm text-[#5f684f]">
            Cargando planes...
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {planes.map((plan) => {
              const esTrial = plan.codigo === "trial_anual";
              const ilimitado =
                plan.limite_terrenos === null || plan.limite_terrenos === undefined;

              return (
                <article
                  key={plan.id}
                  className="flex h-full flex-col rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold text-[#22341c]">{plan.nombre}</h2>
                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#5f684f]">
                      {plan.descripcion || "Plan disponible para operar dentro de SoloTerrenos."}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-[#7c8666]">Pago mensual</p>
                    <p className="mt-1 text-3xl font-bold text-[#22341c]">
                      {formatearPrecio(plan.precio_mensual)}
                    </p>
                    <p className="mt-1 text-sm text-[#7c8666]">
                      Anual: {formatearPrecio(plan.precio_anual)}
                    </p>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-[#4e573d]">
                      <Check className="h-4 w-4 text-[#828d4b]" />
                      <span>
                        {ilimitado ? "Terrenos ilimitados" : `${plan.limite_terrenos} terrenos`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-[#4e573d]">
                      <Check className="h-4 w-4 text-[#828d4b]" />
                      <span>
                        {plan.permite_destacados ? "Incluye destacados" : "Sin destacados"}
                      </span>
                    </div>

                    {esTrial ? (
                      <div className="flex items-center gap-3 text-sm text-[#4e573d]">
                        <Check className="h-4 w-4 text-[#828d4b]" />
                        <span>Asignación manual por administrador</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-[#4e573d]">
                        <Check className="h-4 w-4 text-[#828d4b]" />
                        <span>Pago seguro con Stripe</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    {esTrial ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl border border-[#d7dbc8] bg-[#f7f8f2] px-5 py-3 text-sm font-semibold text-[#7c8666]"
                      >
                        Plan administrado manualmente
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => manejarSuscripcion(plan.codigo)}
                        disabled={planCargando === plan.codigo}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {planCargando === plan.codigo ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Redirigiendo...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Suscribirme
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}