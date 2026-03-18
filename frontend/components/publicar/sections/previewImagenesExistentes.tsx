"use client";

interface Props {
  imagenes: any[];
  imagenesEliminadas?: number[];
  onToggleEliminar?: (id: number) => void;
  soloVista?: boolean;
}

export default function PreviewImagenesExistentes({
  imagenes,
  imagenesEliminadas = [],
  onToggleEliminar,
  soloVista = false,
}: Props) {
  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {imagenes.map((imagen: any, index: number) => {
        const eliminada = imagenesEliminadas.includes(imagen.id);

        return (
          <div
            key={imagen.id}
            className={`relative overflow-hidden rounded-xl border bg-white shadow-sm transition ${
              eliminada
                ? "border-red-200 opacity-60"
                : "border-[#817d58]/25 hover:-translate-y-1 hover:shadow-md"
            }`}
          >
            <div className="absolute left-2 top-2 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {index + 1} / {imagenes.length}
            </div>

            {!soloVista && onToggleEliminar && (
              <button
                type="button"
                onClick={() => onToggleEliminar(imagen.id)}
                className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-white backdrop-blur-sm transition ${
                  eliminada
                    ? "bg-gray-700 hover:bg-gray-800"
                    : "bg-black/65 hover:bg-red-600"
                }`}
                title={eliminada ? "Restaurar imagen" : "Eliminar imagen"}
              >
                {eliminada ? "↺" : "✕"}
              </button>
            )}

            <img
              src={`http://localhost:5000${imagen.url}`}
              alt={`Imagen ${index + 1}`}
              className="h-36 w-full object-cover"
            />

            <div className="p-3">
              <p className="truncate text-sm font-medium text-[#22341c]">
                Imagen existente
              </p>
              <p className="text-xs text-[#817d58]">
                {eliminada ? "Marcada para eliminar" : "Guardada en el terreno"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}