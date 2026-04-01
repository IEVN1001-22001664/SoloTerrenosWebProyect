import Link from "next/link";
import { XCircle, CreditCard, ArrowLeft, RefreshCw } from "lucide-react";

export default function SuscripcionCanceladoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f6f5ef] via-white to-[#f3f1e8] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8e6e6] shadow-sm">
            <XCircle className="h-10 w-10 text-[#7a3d3d]" />
          </div>

          <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
            Pago cancelado
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5f684f] md:text-base">
            La operación no se completó. No se realizó ningún cambio definitivo en tu suscripción.
            Puedes intentarlo nuevamente cuando lo desees.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-[#828d4b]" />
              <h2 className="text-xl font-semibold text-[#22341c]">
                ¿Qué ocurrió?
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#eadfca] bg-[#fffaf1] p-5">
                <p className="text-sm leading-6 text-[#5e5335]">
                  Stripe redirigió esta operación como cancelada. Esto puede pasar si cerraste el
                  checkout, regresaste antes de finalizar o decidiste no completar el pago.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9dccd] bg-[#fafaf6] p-5">
                <p className="text-sm font-semibold text-[#22341c]">
                  Tu cuenta sigue intacta
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4e573d]">
                  No se eliminó información, no se activó un cargo nuevo y tu suscripción actual no
                  se modifica por haber cancelado este intento.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9dccd] bg-[#fafaf6] p-5">
                <p className="text-sm font-semibold text-[#22341c]">
                  Puedes volver a intentarlo
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4e573d]">
                  Si quieres continuar con tu plan, solo regresa a la página de suscripciones o de
                  planes y genera un nuevo intento de pago.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-[#d9dccd] bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-xl font-semibold text-[#22341c]">
              Acciones disponibles
            </h2>

            <div className="grid gap-3">
              <Link
                href="/planes"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar de nuevo
              </Link>

              <Link
                href="/suscripciones"
                className="inline-flex items-center justify-center rounded-2xl border border-[#cfd4bf] px-5 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f7f8f2]"
              >
                Ver suscripciones
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold text-[#5f684f] transition hover:bg-[#f7f8f2]"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}