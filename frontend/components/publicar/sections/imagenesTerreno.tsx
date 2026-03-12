"use client";

import { useState } from "react";

interface Props {
  terrenoId: number;
}

export default function ImageUploader({ terrenoId }: Props) {

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  /* ============================= */
  /* SELECCIONAR IMAGENES         */
  /* ============================= */

  const handleFiles = (files: FileList) => {

    const filesArray = Array.from(files);

    setImagenes(prev => [...prev, ...filesArray]);

    const previews = filesArray.map(file => URL.createObjectURL(file));

    setPreview(prev => [...prev, ...previews]);

  };

  /* ============================= */
  /* DRAG AND DROP                */
  /* ============================= */

  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault();

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }

  };

  /* ============================= */
  /* ELIMINAR IMAGEN              */
  /* ============================= */

  const eliminarImagen = (index: number) => {

    const nuevasImagenes = [...imagenes];
    const nuevasPreview = [...preview];

    nuevasImagenes.splice(index, 1);
    nuevasPreview.splice(index, 1);

    setImagenes(nuevasImagenes);
    setPreview(nuevasPreview);

  };

  /* ============================= */
  /* SUBIR IMAGENES               */
  /* ============================= */

  const subirImagenes = async () => {

    if (imagenes.length === 0) return;

    setSubiendo(true);

    const formData = new FormData();

    imagenes.forEach((img) => {
      formData.append("imagenes", img);
    });

    try {

      const xhr = new XMLHttpRequest();

      xhr.open(
        "POST",
        `http://localhost:5000/api/terrenos/${terrenoId}/imagenes`
      );

      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {

        if (event.lengthComputable) {

          const percent = Math.round(
            (event.loaded * 100) / event.total
          );

          setProgreso(percent);

        }

      };

      xhr.onload = () => {

        setSubiendo(false);
        setProgreso(100);

        alert("Imágenes subidas correctamente");

      };

      xhr.onerror = () => {

        setSubiendo(false);
        alert("Error al subir imágenes");

      };

      xhr.send(formData);

    } catch (error) {

      console.error(error);
      setSubiendo(false);

    }

  };

  return (

    <div className="flex flex-col gap-6">

      {/* AREA DRAG */}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-[#817d58] rounded-xl p-8 text-center cursor-pointer hover:bg-[#828d4b]/10 transition"
      >

        <p className="text-[#22341c] font-semibold">
          Arrastra imágenes aquí
        </p>

        <p className="text-sm text-[#817d58]">
          o selecciona archivos
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleFiles(e.target.files)
          }
          className="mt-4"
        />

      </div>

      {/* PREVIEW */}

      {preview.length > 0 && (

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">

          {preview.map((src, index) => (

            <div
              key={index}
              className="relative"
            >

              <img
                src={src}
                className="w-full h-32 object-cover rounded-lg"
              />

              <button
                onClick={() => eliminarImagen(index)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded"
              >
                X
              </button>

            </div>

          ))}

        </div>

      )}

      {/* PROGRESO */}

      {subiendo && (

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-[#828d4b] h-3 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          />

        </div>

      )}

      {/* BOTON SUBIR */}

      <button
        onClick={subirImagenes}
        disabled={subiendo}
        className="bg-[#22341c] text-white p-3 rounded-lg hover:bg-[#828d4b] transition"
      >
        Subir Imágenes
      </button>

    </div>

  );

}