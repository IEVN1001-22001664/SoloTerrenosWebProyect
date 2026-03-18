"use client";

import PreviewImagenes from "./previewImagenes";
import PreviewImagenesExistentes from "./previewImagenesExistentes";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function ImagenesTerreno({ formData, setFormData }: Props) {
  /* ============================= */
  /* SELECCIONAR IMÁGENES NUEVAS   */
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
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  /* ============================= */
  /* ELIMINAR IMAGEN NUEVA         */
  /* ============================= */
  const eliminarImagenNueva = (index: number) => {
    const nuevasImagenes = [...(formData.imagenes || [])];
    nuevasImagenes.splice(index, 1);

    setFormData({
      ...formData,
      imagenes: nuevasImagenes,
    });
  };

  /* ============================= */
  /* MARCAR IMAGEN EXISTENTE       */
  /* PARA ELIMINAR                 */
  /* ============================= */
  const toggleEliminarImagenExistente = (imagenId: number) => {
    const yaMarcada = (formData.imagenesEliminadas || []).includes(imagenId);

    if (yaMarcada) {
      setFormData({
        ...formData,
        imagenesEliminadas: (formData.imagenesEliminadas || []).filter(
          (id: number) => id !== imagenId
        ),
      });
      return;
    }

    setFormData({
      ...formData,
      imagenesEliminadas: [
        ...(formData.imagenesEliminadas || []),
        imagenId,
      ],
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

      {/* IMÁGENES EXISTENTES */}
      {formData.imagenesExistentes && formData.imagenesExistentes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-[#22341c]">
            Imágenes actuales
          </p>

          <PreviewImagenesExistentes
            imagenes={formData.imagenesExistentes}
            imagenesEliminadas={formData.imagenesEliminadas || []}
            onToggleEliminar={toggleEliminarImagenExistente}
          />
        </div>
      )}

      {/* ÁREA DE CARGA */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#817d58]/35 bg-[#fafaf7] p-8 text-center transition hover:border-[#828d4b] hover:bg-[#f4f6ef]"
      >
        <div className="mb-2 text-3xl">🖼️</div>

        <p className="text-base font-semibold text-[#22341c]">
          Agregar nuevas imágenes
        </p>

        <p className="mt-1 text-sm text-[#817d58]">
          Arrastra imágenes aquí o haz clic para seleccionarlas
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

      <p className="text-xs text-[#817d58]">
        Las imágenes nuevas se guardarán al confirmar los cambios.
      </p>

      {/* PREVIEW NUEVAS */}
      <PreviewImagenes
        imagenes={formData.imagenes || []}
        onEliminar={eliminarImagenNueva}
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