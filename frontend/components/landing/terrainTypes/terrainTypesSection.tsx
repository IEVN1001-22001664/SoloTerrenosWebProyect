"use client";

import { motion } from "framer-motion";
import TerrainTypeCard from "./terrainTypeCard";
import { terrainTypes } from "./terrainTypesData";

export default function TerrainTypesSection() {
  return (
    <section className="py-24 px-6 bg-[#F7F9F6]">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >

          <span className="text-sm font-medium text-[#5C7C3A] uppercase tracking-widest">
            Categorías
          </span>

          <h2 className="text-4xl font-bold text-[#1F3D2B] mt-3">
            Tipos de terrenos
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Explora nuestra amplia variedad de terrenos clasificados por uso y potencial de desarrollo.
          </p>

        </motion.div>

        {/* Grid */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

          {terrainTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <TerrainTypeCard
                title={type.title}
                description={type.description}
                count={type.count}
                icon={type.icon}
              />
            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}