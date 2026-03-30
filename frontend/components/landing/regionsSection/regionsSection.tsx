"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

export default function RegionSection() {
  const regions = [
    {
      name: "Bajío",
      slug: "bajio",
      states: "Querétaro, Guanajuato, Aguascalientes",
      terrenos: "580+ terrenos disponibles",
      image: "/images/regions/bajio.jpg",
    },
    {
      name: "Norte",
      slug: "norte",
      states: "Nuevo León, Chihuahua, Coahuila",
      terrenos: "420+ terrenos disponibles",
      image: "/images/regions/norte.png",
    },
    {
      name: "Occidente",
      slug: "occidente",
      states: "Jalisco, Nayarit, Colima",
      terrenos: "350+ terrenos disponibles",
      image: "/images/regions/occidente.jpg",
    },
    {
      name: "Sureste",
      slug: "sureste",
      states: "Yucatán, Quintana Roo, Campeche",
      terrenos: "280+ terrenos disponibles",
      image: "/images/regions/sureste.jpg",
    },
    {
      name: "Centro",
      slug: "centro",
      states: "CDMX, Estado de México, Morelos",
      terrenos: "620+ terrenos disponibles",
      image: "/images/regions/centro.jpg",
    },
    {
      name: "Frontera",
      slug: "frontera",
      states: "Tijuana, Ciudad Juárez, Reynosa",
      terrenos: "310+ terrenos disponibles",
      image: "/images/regions/frontera.jpg",
    },
  ];

  return (
    <section className="w-full bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-2 text-sm font-semibold tracking-widest text-green-600">
            COBERTURA NACIONAL
          </p>

          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Zonas poblacionales
          </h2>

          <p className="text-lg text-gray-600">
            Encuentra terrenos en las regiones más dinámicas de México
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region, index) => (
            <motion.div
              key={region.slug}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/zonas?region=${region.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${region.image})` }}
                />

                <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/50" />

                <div className="relative flex h-[260px] flex-col justify-end p-6 text-white">
                  <div className="mb-1 flex items-center text-sm opacity-90">
                    <MapPin size={16} className="mr-2" />
                    {region.states}
                  </div>

                  <h3 className="text-2xl font-bold">{region.name}</h3>

                  <p className="mt-1 text-sm opacity-90">
                    {region.terrenos}
                  </p>

                  <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white/30">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}