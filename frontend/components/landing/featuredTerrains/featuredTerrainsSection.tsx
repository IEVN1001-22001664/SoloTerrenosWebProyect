"use client";

import { motion } from "framer-motion";
import TerrainCard from "./terrainCard";
import { terrains } from "./terrainsData";

export default function FeaturedTerrainsSection() {
  return (
    <section className="py-24 px-6 bg-white">

      <div className="max-w-7xl mx-auto">

        {/* Título */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >

          <h2 className="text-4xl font-bold text-[#1F3D2B]">
            Terrenos Destacados
          </h2>

          <p className="text-gray-600 mt-4">
            Oportunidades seleccionadas para inversión y desarrollo.
          </p>

        </motion.div>

        {/* Grid */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {terrains.map((terrain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TerrainCard {...terrain} />
            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}