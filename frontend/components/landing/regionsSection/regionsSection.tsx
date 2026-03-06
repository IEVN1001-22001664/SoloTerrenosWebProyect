"use client";

import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

export default function RegionSection() {

  const regions = [
    {
      name: "Bajío",
      states: "Querétaro, Guanajuato, Aguascalientes",
      terrenos: "580+ terrenos disponibles",
      image: "/images/regions/bajio.jpg"
    },
    {
      name: "Norte",
      states: "Nuevo León, Chihuahua, Coahuila",
      terrenos: "420+ terrenos disponibles",
      image: "/images/regions/norte.png"
    },
    {
      name: "Occidente",
      states: "Jalisco, Nayarit, Colima",
      terrenos: "350+ terrenos disponibles",
      image: "/images/regions/occidente.jpg"
    },
    {
      name: "Sureste",
      states: "Yucatán, Quintana Roo, Campeche",
      terrenos: "280+ terrenos disponibles",
      image: "/images/regions/sureste.jpg"
    },
    {
      name: "Centro",
      states: "CDMX, Estado de México, Morelos",
      terrenos: "620+ terrenos disponibles",
      image: "/images/regions/centro.jpg"
    },
    {
      name: "Frontera",
      states: "Tijuana, Ciudad Juárez, Reynosa",
      terrenos: "310+ terrenos disponibles",
      image: "/images/regions/frontera.jpg"
    }
  ];

  return (
    <section className="w-full py-24 bg-gray-50">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-widest text-green-600 font-semibold mb-2">
            COBERTURA NACIONAL
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Zonas poblacionales
          </h2>

          <p className="text-gray-600 text-lg">
            Encuentra terrenos en las regiones más dinámicas de México
          </p>
        </motion.div>


        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {regions.map((region, index) => (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer"
            >

              {/* IMAGE */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${region.image})` }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

              {/* CONTENT */}
              <div className="relative h-[260px] flex flex-col justify-end p-6 text-white">

                {/* STATES */}
                <div className="flex items-center text-sm opacity-90 mb-1">
                  <MapPin size={16} className="mr-2"/>
                  {region.states}
                </div>

                {/* REGION NAME */}
                <h3 className="text-2xl font-bold">
                  {region.name}
                </h3>

                {/* TERRENOS */}
                <p className="text-sm opacity-90 mt-1">
                  {region.terrenos}
                </p>

                {/* ARROW */}
                <div className="absolute right-5 bottom-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur group-hover:bg-white/30 transition">
                  <ChevronRight size={20}/>
                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}