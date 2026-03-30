"use client";

import { motion } from "framer-motion";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-6 py-20 text-[#22341c]">
      <div className="mx-auto max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">Contacto</h1>

          <p className="mt-4 text-[#5d654f]">
            ¿Tienes dudas o quieres publicar un terreno? Escríbenos.
          </p>
        </motion.div>

        {/* FORM */}
        <div className="mt-10 bg-white p-8 rounded-3xl border border-[#e5dfd1]">

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="Nombre"
              className="p-3 rounded-xl border"
            />

            <input
              type="email"
              placeholder="Correo"
              className="p-3 rounded-xl border"
            />

            <input
              type="text"
              placeholder="Teléfono"
              className="p-3 rounded-xl border md:col-span-2"
            />

            <textarea
              placeholder="Mensaje"
              rows={4}
              className="p-3 rounded-xl border md:col-span-2"
            />

          </div>

          <button className="mt-6 w-full bg-[#22341c] text-white py-3 rounded-xl hover:opacity-90">
            Enviar mensaje
          </button>

        </div>

      </div>
    </main>
  );
}