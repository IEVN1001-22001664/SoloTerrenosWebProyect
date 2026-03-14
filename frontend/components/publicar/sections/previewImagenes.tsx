"use client";

import { useMemo, useState } from "react";

interface Props {
  imagenes: File[];
  onEliminar?: (index: number) => void;
  onReordenar?: (nuevasImagenes: File[]) => void;
  soloVista?: boolean;
}

export default function PreviewImagenes({
  imagenes,
  onEliminar,
  onReordenar,
  soloVista = false,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const previews = useMemo(() => {
    return imagenes.map((imagen) => ({
      file: imagen,
      url: URL.createObjectURL(imagen),
    }));
  }, [imagenes]);

  const moverImagen = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (!onReordenar) return;

    const nuevasImagenes = [...imagenes];
    const [imagenMovida] = nuevasImagenes.splice(fromIndex, 1);
    nuevasImagenes.splice(toIndex, 0, imagenMovida);

    onReordenar(nuevasImagenes);
  };

  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {previews.map(({ file, url }, index) => (
        <div
          key={`${file.name}-${index}`}
          draggable={!soloVista}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => {
            e.preventDefault();
            setHoverIndex(index);
          }}
          onDragLeave={() => {
            setHoverIndex(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) {
              moverImagen(dragIndex, index);
            }
            setDragIndex(null);
            setHoverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setHoverIndex(null);
          }}
          className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 ${
            hoverIndex === index
              ? "border-[#828d4b] scale-[1.02] shadow-md"
              : "border-[#817d58]/25 hover:shadow-md hover:-translate-y-1"
          }`}
        >
          {/* CONTADOR */}
          <div className="absolute left-2 top-2 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {index + 1} / {imagenes.length}
          </div>

          {/* BOTÓN ELIMINAR */}
          {!soloVista && onEliminar && (
            <button
              type="button"
              onClick={() => onEliminar(index)}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-sm text-white backdrop-blur-sm transition hover:bg-red-600"
              title="Eliminar imagen"
            >
              ✕
            </button>
          )}

          {/* IMAGEN */}
          <div className="relative overflow-hidden">
            <img
              src={url}
              alt={`Imagen ${index + 1}`}
              className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
            />

            {/* CAPA HOVER */}
            {!soloVista && (
              <div className="absolute inset-0 flex items-end bg-black/0 p-3 opacity-0 transition duration-200 group-hover:bg-black/15 group-hover:opacity-100">
                <div className="rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  Arrastra para reordenar
                </div>
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="p-3">
            <p className="truncate text-sm font-medium text-[#22341c]">
              {file.name}
            </p>
            <p className="text-xs text-[#817d58]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}