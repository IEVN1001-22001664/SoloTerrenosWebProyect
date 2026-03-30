"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TerrainCard from "./terrainCard";

const API_URL = "http://localhost:5000";

interface Terreno {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  ubicacion?: string;
  municipio?: string;
  estado_region?: string;
  tipo?: string;
  uso_suelo?: string;
  area_m2?: number;
  imagen_principal?: string;
  estado?: string;
}

export default function FeaturedTerrainsSection() {
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTerrenos = async () => {
      try {
        setCargando(true);

        const response = await fetch(`${API_URL}/api/terrenos/destacados`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        setTerrenos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando terrenos destacados:", error);
        setTerrenos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarTerrenos();
  }, []);

  const terrenosCarrusel = useMemo(() => {
    if (!terrenos.length) return [];
    return [...terrenos, ...terrenos];
  }, [terrenos]);

  return (
    <section className="overflow-hidden bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-4xl font-bold text-[#1F3D2B]">
            Terrenos Destacados
          </h2>

          <p className="mt-4 text-gray-600">
            Oportunidades seleccionadas para inversión y desarrollo.
          </p>
        </motion.div>

        {cargando ? (
          <div className="text-center text-[#817d58]">
            Cargando terrenos destacados...
          </div>
        ) : terrenos.length === 0 ? (
          <div className="text-center text-[#817d58]">
            No hay terrenos destacados disponibles por el momento.
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent" />

            <div className="overflow-hidden">
              <div className="featured-carousel-track flex w-max gap-6">
                {terrenosCarrusel.map((terreno, index) => (
                  <div
                    key={`${terreno.id}-${index}`}
                    className="w-[300px] shrink-0 md:w-[320px]"
                  >
                    <TerrainCard
                      id={terreno.id}
                      title={terreno.titulo}
                      location={
                        [terreno.municipio, terreno.estado_region]
                          .filter(Boolean)
                          .join(", ") ||
                        terreno.ubicacion ||
                        "Ubicación no definida"
                      }
                      price={`$${Number(terreno.precio || 0).toLocaleString("es-MX")}`}
                      area={
                        terreno.area_m2
                          ? `${Math.round(terreno.area_m2).toLocaleString("es-MX")} m²`
                          : "Área no disponible"
                      }
                      image={
                        terreno.imagen_principal
                          ? terreno.imagen_principal.startsWith("http")
                            ? terreno.imagen_principal
                            : `${API_URL}${terreno.imagen_principal}`
                          : "/images/terreno-placeholder.jpg"
                      }
                      status={terreno.uso_suelo || terreno.tipo || "Terreno"}
                    />
                  </div>
                ))}
              </div>
            </div>

            <style jsx>{`
              .featured-carousel-track {
                animation: featured-scroll 38s linear infinite;
              }

              .featured-carousel-track:hover {
                animation-play-state: paused;
              }

              @keyframes featured-scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </section>
  );
}