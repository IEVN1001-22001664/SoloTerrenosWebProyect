"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function GuiaVendedoresPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-6 py-20 text-[#22341c]">
      <div className="mx-auto max-w-5xl space-y-12">

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold">
            Guía para vender terrenos
          </h1>

          <p className="mt-4 text-[#5d654f] max-w-3xl">
            Aprende cómo publicar y vender tu terreno en SoloTerrenos
            de forma efectiva.
          </p>
        </motion.div>

        {/* PASOS */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-semibold mb-2">1. Regístrate</h3>
            <p className="text-sm text-[#5d654f]">
              Crea tu cuenta y accede al panel de colaborador.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-semibold mb-2">2. Publica</h3>
            <p className="text-sm text-[#5d654f]">
              Agrega información completa, imágenes y el polígono del terreno.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-semibold mb-2">3. Vende</h3>
            <p className="text-sm text-[#5d654f]">
              Recibe contactos interesados y concreta oportunidades.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="bg-[#22341c] text-white p-8 rounded-3xl">

          <h2 className="text-2xl font-bold">
            Empieza a publicar hoy
          </h2>

          <p className="mt-3 text-white/80">
            Accede a nuestra plataforma y comienza a mostrar tu terreno.
          </p>

          <Link
            href="/suscripciones"
            className="inline-block mt-5 bg-[#828d4b] px-6 py-3 rounded-xl font-semibold"
          >
            Publicar terreno
          </Link>

        </div>

      </div>
    </main>
  );
}