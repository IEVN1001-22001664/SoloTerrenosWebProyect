"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const tipos = [
  {
    nombre: "Industriales",
    slug: "industrial",
    descripcion:
      "Terrenos ideales para fábricas, bodegas, parques industriales o centros logísticos.",
    imagen: "https://picsum.photos/900/600?random=1",
  },
  {
    nombre: "Comerciales",
    slug: "comercial",
    descripcion:
      "Ubicaciones estratégicas para negocios, plazas comerciales o desarrollos de servicios.",
    imagen: "https://picsum.photos/900/600?random=2",
  },
  {
    nombre: "Urbanos",
    slug: "urbano",
    descripcion:
      "Terrenos ubicados dentro de zonas urbanas con acceso a infraestructura y servicios.",
    imagen: "https://picsum.photos/900/600?random=3",
  },
  {
    nombre: "Habitacionales",
    slug: "habitacional",
    descripcion:
      "Ideales para desarrollo de vivienda, fraccionamientos o casas particulares.",
    imagen: "https://picsum.photos/900/600?random=4",
  },
  {
    nombre: "Rurales",
    slug: "rural",
    descripcion:
      "Perfectos para actividades agrícolas, ganaderas o proyectos ecológicos.",
    imagen: "https://picsum.photos/900/600?random=5",
  },
  {
    nombre: "Inversión",
    slug: "inversion",
    descripcion:
      "Terrenos con alto potencial de plusvalía y crecimiento a largo plazo.",
    imagen: "https://picsum.photos/900/600?random=6",
  },
];

export default function TiposPage() {
  return (
    <main className="bg-[#f7f7f4]">

      {/* HERO */}

      <section className="max-w-6xl mx-auto px-6 py-16 text-center">

        <h1 className="text-4xl font-bold text-[#22341c] mb-6">
          Tipos de Terrenos
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Explora terrenos según su tipo y descubre cuál se adapta mejor
          a tus necesidades de inversión, desarrollo o vivienda.
        </p>

      </section>

      {/* LISTA DE TIPOS */}

      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-16">

        {tipos.map((tipo, index) => (
          <motion.div
            key={tipo.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`grid md:grid-cols-2 gap-10 items-center ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >

            {/* IMAGEN */}

            <div className="relative h-[320px] rounded-xl overflow-hidden shadow-lg">

              <Image
                src={tipo.imagen}
                alt={tipo.nombre}
                fill
                className="object-cover"
              />

            </div>

            {/* TEXTO */}

            <div>

              <h2 className="text-3xl font-semibold text-[#22341c] mb-4">
                Terrenos {tipo.nombre}
              </h2>

              <p className="text-gray-700 mb-6">
                {tipo.descripcion}
              </p>

              <Link
                href={`/terrenos?tipo=${tipo.slug}`}
                className="inline-block bg-[#828d4b] text-white px-6 py-3 rounded-lg hover:bg-[#22341c] transition"
              >
                Ver terrenos {tipo.nombre.toLowerCase()}
              </Link>

            </div>

          </motion.div>
        ))}

      </section>

    </main>
  );
}