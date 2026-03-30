"use client";

import { motion } from "framer-motion";

export default function PrivacidadPage() {
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
              Aviso de privacidad
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              En SoloTerrenos valoramos la privacidad de nuestros usuarios y el
              tratamiento responsable de su información personal.
            </p>
          </div>

          <div className="space-y-8 px-8 py-10">
            <section>
              <h2 className="text-xl font-semibold">1. Información que recopilamos</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Podemos recopilar información de contacto, datos de cuenta,
                información de publicaciones, mensajes enviados dentro de la
                plataforma y datos técnicos necesarios para operar el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Uso de la información</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                La información recopilada se utiliza para permitir el acceso a la
                plataforma, administrar publicaciones, facilitar la comunicación
                entre usuarios, mejorar la experiencia de navegación y brindar
                soporte técnico y comercial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Protección de datos</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Implementamos medidas razonables de seguridad para proteger los
                datos personales contra acceso no autorizado, pérdida, alteración o
                uso indebido. Sin embargo, ningún sistema en internet puede
                garantizar seguridad absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Compartición de información</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                SoloTerrenos no vende información personal de sus usuarios. Algunos
                datos podrán ser visibles dentro de la plataforma cuando sean
                necesarios para el funcionamiento del servicio o para facilitar la
                intermediación entre compradores, vendedores y colaboradores.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Derechos del usuario</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Los usuarios podrán solicitar la actualización, corrección o
                eliminación de su información personal conforme a la normativa
                aplicable y a los canales de contacto habilitados por la
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Cambios al aviso</h2>
              <p className="mt-3 leading-7 text-[#5d654f]">
                Este aviso de privacidad podrá actualizarse en cualquier momento
                para reflejar cambios legales, técnicos o de operación. La versión
                vigente será la publicada en este apartado.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}