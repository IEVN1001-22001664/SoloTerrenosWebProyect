"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TerrainTypeCard from "./terrainTypeCard";
import { terrainTypes } from "./terrainTypesData";

export default function TerrainTypesSection() {
  return (
    <section className="bg-[#F7F9F6] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-[#5C7C3A]">
            Categorías
          </span>

          <h2 className="mt-3 text-4xl font-bold text-[#1F3D2B]">
            Tipos de terrenos
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Explora nuestra amplia variedad de terrenos clasificados por uso y potencial de desarrollo.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {terrainTypes.map((type, index) => (
            <motion.div
              key={type.slug + index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Link href={`/tipos#${type.slug}`} className="block">
                <TerrainTypeCard
                  title={type.title}
                  description={type.description}
                  count={type.count}
                  icon={type.icon}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}