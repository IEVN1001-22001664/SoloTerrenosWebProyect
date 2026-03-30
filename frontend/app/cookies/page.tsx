"use client";

import { motion } from "framer-motion";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-6 py-20 text-[#22341c]">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[30px] border border-[#e5dfd1] bg-white shadow-[0_16px_45px_rgba(34,52,28,0.06)]"
        >
          <div className="border-b border-[#eee7d9] bg-gradient-to-r from-[#22341c] to-[#3a522f] px-8 py-10 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/75">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Política de cookies
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              Esta política explica cómo SoloTerrenos utiliza cookies y tecnologías
              similares para mejorar la experiencia del usuario.
            </p>
          </div>

          <div className="space-y-8 px-8 py-10">
            <section>
              <h2 className="text-xl font-semibold">1. ¿Qué son las cookies?</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Las cookies son pequeños archivos que se almacenan en el navegador
                del usuario y permiten recordar información relacionada con la
                navegación, preferencias y sesiones activas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. ¿Para qué las usamos?</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                En SoloTerrenos podemos usar cookies para mantener sesiones de
                acceso, recordar configuraciones básicas, mejorar la experiencia del
                usuario, analizar el uso general de la plataforma y optimizar el
                rendimiento del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Tipos de cookies</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Podemos utilizar cookies técnicas, funcionales y, en su caso, de
                análisis. Cada una cumple una función distinta para permitir el uso
                correcto de la plataforma y entender mejor su desempeño.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Gestión de cookies</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                El usuario puede configurar su navegador para aceptar, bloquear o
                eliminar cookies. Algunas funciones de la plataforma podrían verse
                afectadas si ciertas cookies se deshabilitan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Actualizaciones</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Esta política podrá actualizarse para reflejar cambios en la
                operación del sitio, en herramientas tecnológicas o en obligaciones
                legales aplicables.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}