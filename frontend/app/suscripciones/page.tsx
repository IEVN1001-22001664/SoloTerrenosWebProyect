import { Suspense } from "react";
import SuscripcionesClient from "@/components/suscripciones/suscripcionesClient";

function SuscripcionesFallback() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          Cargando suscripciones...
        </div>
      </div>
    </main>
  );
}

export default function SuscripcionesPage() {
  return (
    <Suspense fallback={<SuscripcionesFallback />}>
      <SuscripcionesClient />
    </Suspense>
  );
}