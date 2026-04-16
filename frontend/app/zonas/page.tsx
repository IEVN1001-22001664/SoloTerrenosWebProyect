import { Suspense } from "react";
import ZonasClient from "@/components/zonas/zonasClient";

function ZonasFallback() {
  return (
    <main className="min-h-screen bg-white px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 md:mb-6">
          <h1 className="text-3xl font-bold text-[#22341c]">
            Zonas
          </h1>
          <p className="mt-1 text-sm text-[#817d58]">
            Cargando mapa y terrenos...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ZonasPage() {
  return (
    <Suspense fallback={<ZonasFallback />}>
      <ZonasClient />
    </Suspense>
  );
}
