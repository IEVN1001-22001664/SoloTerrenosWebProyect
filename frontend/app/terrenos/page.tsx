import { Suspense } from "react";
import TerrenosClient from "./terrenosClient";

function TerrenosFallback() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] pb-14 pt-20">
      <section className="mx-auto w-full max-w-[1680px] px-4 md:px-6 xl:px-8 2xl:px-10">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-[#817d58]/12 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#22341c] via-[#2f4727] to-[#828d4b] px-6 py-8 text-white md:px-8 md:py-10">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Terrenos disponibles
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
              Cargando publicaciones...
            </p>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
          Cargando terrenos...
        </div>
      </section>
    </main>
  );
}

export default function TerrenosPage() {
  return (
    <Suspense fallback={<TerrenosFallback />}>
      <TerrenosClient />
    </Suspense>
  );
}