"use client";

import { motion } from "framer-motion";
import { Search, MessageCircle, Key } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-28 px-6 bg-white">

      <div className="max-w-6xl mx-auto text-center">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-sm font-medium tracking-widest text-[#5C7C3A] uppercase">
            Proceso simple
          </span>

          <h2 className="text-4xl font-bold text-[#1F3D2B] mt-3">
            ¿Cómo funciona?
          </h2>

          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Encontrar tu terreno ideal es fácil con SoloTerrenos
          </p>
        </motion.div>

        {/* Steps */}

        <div className="relative grid md:grid-cols-3 gap-16 items-start">

          {/* Línea horizontal */}

          <div className="hidden md:block absolute top-16 left-0 w-full h-[2px] bg-gray-200" />

          {/* STEP 1 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative flex flex-col items-center text-center"
          >

            {/* Icon */}

            <motion.div
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="
              relative
              w-20
              h-20
              flex
              items-center
              justify-center
              rounded-full
              bg-[#E8EFE6]
              text-[#5C7C3A]
              z-10
              "
            >
              <Search size={30} />

              {/* número */}

              <div className="
              absolute
              -top-2
              -right-2
              w-7
              h-7
              bg-[#5C7C3A]
              text-white
              text-xs
              rounded-full
              flex
              items-center
              justify-center
              font-semibold
              ">
                01
              </div>

            </motion.div>

            <h3 className="mt-8 text-xl font-semibold text-[#1F3D2B]">
              Explora terrenos
            </h3>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-xs">
              Busca entre miles de terrenos disponibles usando filtros
              por ubicación, tipo, precio y superficie.
            </p>

          </motion.div>


          {/* STEP 2 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            className="relative flex flex-col items-center text-center"
          >

            <motion.div
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="
              relative
              w-20
              h-20
              flex
              items-center
              justify-center
              rounded-full
              bg-[#E8EFE6]
              text-[#5C7C3A]
              z-10
              "
            >
              <MessageCircle size={30} />

              <div className="
              absolute
              -top-2
              -right-2
              w-7
              h-7
              bg-[#5C7C3A]
              text-white
              text-xs
              rounded-full
              flex
              items-center
              justify-center
              font-semibold
              ">
                02
              </div>

            </motion.div>

            <h3 className="mt-8 text-xl font-semibold text-[#1F3D2B]">
              Contacta al vendedor
            </h3>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-xs">
              Comunícate directamente con el propietario o agente
              inmobiliario para resolver tus dudas.
            </p>

          </motion.div>


          {/* STEP 3 */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative flex flex-col items-center text-center"
          >

            <motion.div
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="
              relative
              w-20
              h-20
              flex
              items-center
              justify-center
              rounded-full
              bg-[#E8EFE6]
              text-[#5C7C3A]
              z-10
              "
            >
              <Key size={30} />

              <div className="
              absolute
              -top-2
              -right-2
              w-7
              h-7
              bg-[#5C7C3A]
              text-white
              text-xs
              rounded-full
              flex
              items-center
              justify-center
              font-semibold
              ">
                03
              </div>

            </motion.div>

            <h3 className="mt-8 text-xl font-semibold text-[#1F3D2B]">
              Compra tu terreno
            </h3>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-xs">
              Cierra el trato de forma segura y comienza tu proyecto
              en el terreno ideal.
            </p>

          </motion.div>

        </div>

      </div>

    </section>
  );
}