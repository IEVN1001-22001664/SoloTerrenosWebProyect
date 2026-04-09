"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TerrainCard from "./terrainCard";

const API_URL = "http://localhost:5000";
const CARD_WIDTH_MOBILE = 300 + 24; // ancho + gap
const CARD_WIDTH_DESKTOP = 320 + 24;

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToScroll, setCardsToScroll] = useState(5);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const updateResponsiveConfig = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setCardsToScroll(1);
        setCardWidth(CARD_WIDTH_MOBILE);
      } else if (width < 1280) {
        setCardsToScroll(2);
        setCardWidth(CARD_WIDTH_DESKTOP);
      } else {
        setCardsToScroll(5);
        setCardWidth(CARD_WIDTH_DESKTOP);
      }
    };

    updateResponsiveConfig();
    window.addEventListener("resize", updateResponsiveConfig);

    return () => window.removeEventListener("resize", updateResponsiveConfig);
  }, []);

  const terrenosCarrusel = useMemo(() => {
    if (!terrenos.length) return [];
    return [...terrenos, ...terrenos];
  }, [terrenos]);

  const totalOriginal = terrenos.length;

  const nextSlide = () => {
    if (!totalOriginal) return;

    setCurrentIndex((prev) => {
      const next = prev + cardsToScroll;
      return next >= totalOriginal ? 0 : next;
    });
  };

  const prevSlide = () => {
    if (!totalOriginal) return;

    setCurrentIndex((prev) => {
      const next = prev - cardsToScroll;
      return next < 0
        ? Math.max(totalOriginal - cardsToScroll, 0)
        : next;
    });
  };

  const startAutoPlay = () => {
    if (!totalOriginal) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= totalOriginal ? 0 : next;
      });
    }, 3500);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();

    return () => stopAutoPlay();
  }, [totalOriginal, cardsToScroll]);

  const getImageUrl = (img?: string) => {
    if (!img) return "/images/terreno-placeholder.png";
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

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
          <div
            className="relative"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
          >
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent" />

            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/95 text-[#22341c] shadow-md transition hover:scale-105 hover:bg-white md:left-2"
              aria-label="Ver terrenos anteriores"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#817d58]/15 bg-white/95 text-[#22341c] shadow-md transition hover:scale-105 hover:bg-white md:right-2"
              aria-label="Ver siguientes terrenos"
            >
              <ChevronRight size={22} />
            </button>

            <div className="overflow-hidden">
              <motion.div
                animate={{ x: `-${currentIndex * cardWidth}px` }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
                className="flex w-max gap-6"
              >
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
                      image={getImageUrl(terreno.imagen_principal)}
                      status={terreno.uso_suelo || terreno.tipo || "Terreno"}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}