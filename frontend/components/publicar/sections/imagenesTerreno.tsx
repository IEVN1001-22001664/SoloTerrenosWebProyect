"use client";

import PreviewImagenes from "./previewImagenes";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function ImagenesTerreno({ formData, setFormData }: Props) {
  /* ============================= */
  /* SELECCIONAR IMÁGENES          */
  /* ============================= */
  const handleFiles = (files: FileList) => {
    const archivos = Array.from(files);

    setFormData({
      ...formData,
      imagenes: [...(formData.imagenes || []), ...archivos],
    });
  };

  /* ============================= */
  /* DRAG AND DROP                 */
  /* ============================= */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  /* ============================= */
  /* ELIMINAR IMAGEN               */
  /* ============================= */
  const eliminarImagen = (index: number) => {
    const nuevasImagenes = [...(formData.imagenes || [])];
    nuevasImagenes.splice(index, 1);

    setFormData({
      ...formData,
      imagenes: nuevasImagenes,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* TITULO */}
      <div>
        <h2 className="text-2xl font-semibold text-[#22341c]">
          Imágenes del terreno
        </h2>

        <p className="text-sm text-[#817d58]">
          Agrega imágenes del terreno para mostrar su estado, ubicación y entorno.
        </p>
      </div>

      {/* ÁREA DE CARGA */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#817d58]/35 bg-[#fafaf7] p-8 text-center transition hover:border-[#828d4b] hover:bg-[#f4f6ef]"
      >
        <div className="mb-2 text-3xl">🖼️</div>

        <p className="text-base font-semibold text-[#22341c]">
          Arrastra imágenes aquí
        </p>

        <p className="mt-1 text-sm text-[#817d58]">
          o haz clic para seleccionarlas desde tu dispositivo
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleFiles(e.target.files)
          }
          className="hidden"
        />
      </label>

      {/* INFO */}
      <p className="text-xs text-[#817d58]">
        Las imágenes se guardarán temporalmente hasta llegar a la confirmación final.
      </p>

      {/* PREVIEW */}
      <PreviewImagenes
        imagenes={formData.imagenes || []}
        onEliminar={eliminarImagen}
        onReordenar={(nuevasImagenes) =>
          setFormData({
            ...formData,
            imagenes: nuevasImagenes,
          })
        }
      />
    </div>
  );
}