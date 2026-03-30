"use client";

import { motion } from "framer-motion";

export default function TerminosPage() {
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
              Términos y condiciones
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              El uso de SoloTerrenos implica la aceptación de los presentes
              términos y condiciones de uso de la plataforma.
            </p>
          </div>

          <div className="space-y-8 px-8 py-10">
            <section>
              <h2 className="text-xl font-semibold">1. Uso de la plataforma</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                SoloTerrenos es una plataforma digital orientada a la publicación,
                búsqueda, promoción e intermediación de terrenos. El usuario se
                compromete a utilizarla de forma lícita, responsable y conforme a
                estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Registro de usuarios</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Algunos servicios requieren registro. El usuario es responsable de
                la veracidad de la información proporcionada y del uso adecuado de
                sus credenciales de acceso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Publicaciones</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Los colaboradores y usuarios autorizados son responsables del
                contenido, veracidad, documentación y legalidad de los terrenos
                publicados. SoloTerrenos podrá revisar, pausar o retirar
                publicaciones que incumplan lineamientos internos o normativa
                aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Limitación de responsabilidad</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                SoloTerrenos actúa como plataforma de intermediación digital y no
                garantiza la concreción de operaciones inmobiliarias, la exactitud
                absoluta de toda la información publicada por terceros ni la
                disponibilidad continua e ininterrumpida del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Conducta prohibida</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Está prohibido publicar información falsa, usar la plataforma con
                fines fraudulentos, vulnerar cuentas de terceros, intentar afectar
                la seguridad del sistema o realizar actividades contrarias a la ley.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Modificaciones</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                SoloTerrenos podrá modificar estos términos y condiciones cuando sea
                necesario. Los cambios entrarán en vigor a partir de su publicación
                en la plataforma.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}