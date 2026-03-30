"use client";

import { motion } from "framer-motion";

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-6 py-20 text-[#22341c]">
      <div className="mx-auto max-w-5xl space-y-12">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold md:text-5xl">
            Sobre SoloTerrenos
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-7 text-[#5d654f]">
            Somos una plataforma especializada en la comercialización de terrenos en México.
            Nuestro objetivo es conectar oportunidades reales con compradores e inversionistas,
            eliminando el ruido de los portales tradicionales.
          </p>
        </motion.div>

        {/* BLOQUES */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl p-6 border border-[#e5dfd1]">
            <h3 className="font-semibold text-lg mb-2">Enfoque</h3>
            <p className="text-sm text-[#5d654f]">
              Nos enfocamos exclusivamente en terrenos para ofrecer filtros,
              datos y visualización especializada.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e5dfd1]">
            <h3 className="font-semibold text-lg mb-2">Tecnología</h3>
            <p className="text-sm text-[#5d654f]">
              Utilizamos mapas interactivos, polígonos y datos estructurados
              para mejorar la toma de decisiones.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e5dfd1]">
            <h3 className="font-semibold text-lg mb-2">Transparencia</h3>
            <p className="text-sm text-[#5d654f]">
              Buscamos claridad en la información y facilitar el contacto
              directo entre interesados.
            </p>
          </div>

        </div>

        {/* VISIÓN */}
        <div className="bg-white rounded-3xl p-8 border border-[#e5dfd1]">
          <h2 className="text-2xl font-bold">Nuestra visión</h2>
          <p className="mt-4 text-[#5d654f] leading-7">
            Convertirnos en la plataforma líder de terrenos en México,
            ofreciendo una experiencia especializada, intuitiva y enfocada
            en inversión inmobiliaria.
          </p>
        </div>

      </div>
    </main>
  );
}