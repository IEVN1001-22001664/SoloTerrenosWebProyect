"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SellerSection() {
  const benefits = [
    "Publicación rápida en menos de 5 minutos",
    "Mayor visibilidad con compradores verificados",
    "Planes de suscripción accesibles",
    "Estadísticas de rendimiento en tiempo real",
    "Soporte dedicado para vendedores",
  ];

  return (
    <section className="w-full py-28 bg-gradient-to-br from-[#0f3d2e] via-[#134b38] to-[#0c2f24] text-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-green-400 text-sm tracking-widest font-semibold mb-4">
            PARA VENDEDORES
          </p>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Publica tu terreno con <br />
            <span className="text-green-400">SoloTerrenos</span>
          </h2>

          <p className="text-gray-300 text-lg mb-8 max-w-xl">
            Conecta con miles de compradores e inversionistas interesados en tu
            propiedad. Nuestra plataforma te ayuda a vender más rápido.
          </p>

          {/* BENEFITS */}
          <div className="space-y-4 mb-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500/20">
                  <Check size={16} className="text-green-400" />
                </div>

                <span className="text-gray-200">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4">

            <Link href="/suscripciones">
              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-lg font-medium">
                Comenzar a vender
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/planes">
              <button className="border border-white/30 hover:border-white px-6 py-3 rounded-lg font-medium transition">
                Ver planes y precios
              </button>
            </Link>

          </div>
        </motion.div>

        {/* RIGHT SIDE CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/10"
        >

          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-10 text-center mb-10">

            <div>
              <h3 className="text-3xl font-bold text-green-400">15K+</h3>
              <p className="text-gray-300 text-sm mt-1">
                Terrenos vendidos
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-400">98%</h3>
              <p className="text-gray-300 text-sm mt-1">
                Satisfacción
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-400">48hrs</h3>
              <p className="text-gray-300 text-sm mt-1">
                Tiempo promedio
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-400">500+</h3>
              <p className="text-gray-300 text-sm mt-1">
                Vendedores activos
              </p>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="border-t border-white/10 pt-6 text-center">

            <p className="text-gray-300 italic mb-4">
              SoloTerrenos me ayudó a vender mi terreno en menos de una semana.
              El proceso fue increíblemente sencillo.
            </p>

            <span className="text-green-400 font-medium">
              — Carlos Mendoza, Querétaro
            </span>

          </div>

        </motion.div>

      </div>
    </section>
  );
}