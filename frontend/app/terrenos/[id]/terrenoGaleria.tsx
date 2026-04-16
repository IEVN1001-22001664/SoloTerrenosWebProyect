"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Grid2x2, X } from "lucide-react";

interface ImagenItem {
  id: number;
  url: string;
}

interface Props {
  titulo: string;
  imagenes: ImagenItem[];
}

export default function TerrenoGaleria({ titulo, imagenes }: Props) {
  const lista = useMemo(() => {
    if (imagenes.length > 0) return imagenes;
    return [{ id: 0, url: "/images/terreno-placeholder.jpg" }];
  }, [imagenes]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeImage = lista[activeIndex];
  const previewImages = lista.slice(1, 5);
  const extraCount = lista.length > 5 ? lista.length - 5 : 0;

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? lista.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === lista.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;

    if (touchStartX.current === null || touchEndX.current === null) return;

    const delta = touchStartX.current - touchEndX.current;

    if (Math.abs(delta) < 40) return;

    if (delta > 0) goNext();
    else goPrev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#817d58]/12 bg-white p-3 shadow-sm md:p-4">
        {/* MOBILE: carrusel principal */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[#f0ede3]">
            <img
              src={activeImage?.url || "/images/terreno-placeholder.jpg"}
              alt={titulo}
              className="h-[280px] w-full object-cover"
              onClick={() => openLightbox(activeIndex)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/terreno-placeholder.jpg";
              }}
            />

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22341c] shadow-md"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22341c] shadow-md"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {lista.length}
            </div>

            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-sm font-medium text-[#22341c] shadow-md"
            >
              <Expand size={15} />
              Ampliar
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {lista.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  index === activeIndex
                    ? "border-[#22341c]"
                    : "border-[#e7e2d3]"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Miniatura ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/terreno-placeholder.jpg";
                  }}
                />
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#817d58]/15 bg-white px-4 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f3f0e8]"
            >
              <Grid2x2 size={16} />
              Ver todas las fotos
            </button>
          </div>
        </div>

        {/* DESKTOP/TABLET: galería completa */}
        <div className="hidden md:grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="relative overflow-hidden rounded-[1.8rem] bg-[#f0ede3] group">
            <img
              src={activeImage?.url || "/images/terreno-placeholder.jpg"}
              alt={titulo}
              className="h-[430px] w-full cursor-zoom-in object-cover xl:h-[520px]"
              onClick={() => openLightbox(activeIndex)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/terreno-placeholder.jpg";
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22341c] shadow-md transition hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#22341c] shadow-md transition hover:bg-white"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {lista.length}
            </div>

            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-[#22341c] shadow-md transition hover:bg-white"
            >
              <Expand size={16} />
              Ampliar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => {
              const imagen = previewImages[i];
              const realIndex = i + 1;
              const isLastSlot = i === 3;
              const showMoreOverlay = isLastSlot && extraCount > 0 && imagen;

              return (
                <button
                  key={imagen?.id ?? `placeholder-${i}`}
                  type="button"
                  onClick={() => openLightbox(imagen ? realIndex : 0)}
                  className={`relative overflow-hidden rounded-[1.45rem] border-2 bg-[#f0ede3] text-left transition ${
                    imagen && activeIndex === realIndex
                      ? "border-[#22341c]"
                      : "border-transparent hover:border-[#9f885c]"
                  }`}
                >
                  <img
                    src={imagen?.url || activeImage?.url || "/images/terreno-placeholder.jpg"}
                    alt={`Vista previa ${realIndex + 1}`}
                    className="h-[200px] w-full object-cover xl:h-[253px]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/terreno-placeholder.jpg";
                    }}
                  />

                  {showMoreOverlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
                      <span className="text-2xl font-bold">+{extraCount}</span>
                      <span className="mt-1 text-sm font-medium">fotos</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="absolute right-4 top-4 z-20 flex items-center gap-3">
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
              {activeIndex + 1} / {lista.length}
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cerrar galería"
            >
              <X size={22} />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-4 md:h-12 md:w-12"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-4 md:h-12 md:w-12"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={24} />
          </button>

          <div
            className="flex h-full w-full items-center justify-center px-4 py-16 md:px-6"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activeImage?.url || "/images/terreno-placeholder.jpg"}
              alt={titulo}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/terreno-placeholder.jpg";
              }}
            />
          </div>

          <div
            className="absolute bottom-4 left-1/2 z-20 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl bg-white/8 px-3 py-3 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {lista.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-14 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition md:h-16 md:w-20 ${
                  index === activeIndex
                    ? "border-white"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Miniatura lightbox ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/terreno-placeholder.jpg";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}