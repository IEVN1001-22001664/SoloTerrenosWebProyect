"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import InfoBasica from "@/components/publicar/sections/infoBasica";
import UbicacionMapa from "@/components/publicar/sections/ubicacionMapa";
import CaracteristicasTerreno from "@/components/publicar/sections/CaracteristicasTerreno";
import InfoLegal from "@/components/publicar/sections/infoLegal";
import ImagenesTerreno from "@/components/publicar/sections/imagenesTerreno";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
interface Props {
  terrenoId: string;
  formData: any;
  setFormData: (data: any) => void;
}

export default function EditarForm({
  terrenoId,
  formData,
  setFormData,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [guardando, setGuardando] = useState(false);

  const next = () => setStep((prev: number) => Math.min(prev + 1, 6));
  const back = () => setStep((prev: number) => Math.max(prev - 1, 1));

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      /* ============================= */
      /* 1. ACTUALIZAR TERRENO         */
      /* ============================= */
      const response = await fetch(
        `${API_URL}/api/terrenos/${terrenoId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            ubicacion: [
              formData.colonia,
              formData.municipio,
              formData.estado_region,
            ]
              .filter(Boolean)
              .join(", "),
            tipo: formData.tipo,

            estado_region: formData.estado_region,
            municipio: formData.municipio,
            colonia: formData.colonia,
            direccion: formData.direccion,
            codigo_postal: formData.codigo_postal,

            poligono: formData.poligono,

            topografia: formData.topografia,
            forma: formData.forma,
            tipo_propiedad: formData.tipo_propiedad,
            uso_suelo: formData.uso_suelo,
            negociable: formData.negociable,

            escritura: formData.escritura,
            estatus_legal: formData.estatus_legal,
            gravamen: formData.gravamen,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al actualizar el terreno.");
        setGuardando(false);
        return;
      }

      /* ============================= */
      /* 2. ELIMINAR IMÁGENES MARCADAS */
      /* ============================= */
      if (
        formData.imagenesEliminadas &&
        formData.imagenesEliminadas.length > 0
      ) {
        for (const imagenId of formData.imagenesEliminadas) {
          const responseEliminarImagen = await fetch(
            `${API_URL}/api/imagenes/${imagenId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (!responseEliminarImagen.ok) {
            alert("El terreno se actualizó, pero hubo un error al eliminar una imagen.");
            setGuardando(false);
            return;
          }
        }
      }

      /* ============================= */
      /* 3. SUBIR IMÁGENES NUEVAS      */
      /* ============================= */
      if (formData.imagenes && formData.imagenes.length > 0) {
        const formDataImagenes = new FormData();

        formData.imagenes.forEach((img: File) => {
          formDataImagenes.append("imagenes", img);
        });

        const responseImagenes = await fetch(
          `${API_URL}/api/terrenos/${terrenoId}/imagenes`,
          {
            method: "POST",
            credentials: "include",
            body: formDataImagenes,
          }
        );

        if (!responseImagenes.ok) {
          alert("El terreno se actualizó, pero hubo un error al subir las imágenes nuevas.");
          setGuardando(false);
          return;
        }
      }

      /* ============================= */
      /* 4. ELIMINAR DOCUMENTOS        */
      /* ============================= */
      if (
        formData.documentosEliminados &&
        formData.documentosEliminados.length > 0
      ) {
        for (const documentoId of formData.documentosEliminados) {
          const responseEliminarDocumento = await fetch(
            `${API_URL}/api/documentos/${documentoId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (!responseEliminarDocumento.ok) {
            alert("El terreno se actualizó, pero hubo un error al eliminar un documento.");
            setGuardando(false);
            return;
          }
        }
      }

      /* ============================= */
      /* 5. SUBIR DOCUMENTOS NUEVOS    */
      /* ============================= */
      if (formData.documentos && formData.documentos.length > 0) {
        const formDataDocumentos = new FormData();

        formData.documentos.forEach((doc: File) => {
          formDataDocumentos.append("documentos", doc);
        });

        const responseDocumentos = await fetch(
          `${API_URL}/api/terrenos/${terrenoId}/documentos`,
          {
            method: "POST",
            credentials: "include",
            body: formDataDocumentos,
          }
        );

        if (!responseDocumentos.ok) {
          alert("El terreno se actualizó, pero hubo un error al subir los documentos nuevos.");
          setGuardando(false);
          return;
        }
      }

      alert("Terreno actualizado correctamente");
      router.push("/colaborador/misTerrenos");
      router.refresh();
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error de conexión al guardar los cambios.");
      setGuardando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#817d58]/20 bg-white p-8 shadow-sm">
      {/* ENCABEZADO */}
      <div className="mb-8">
        <p className="text-sm font-medium text-[#817d58]">
          Editando terreno #{terrenoId}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#22341c]">
          Editar terreno
        </h1>

        <p className="mt-2 text-sm text-[#817d58]">
          Actualiza la información del terreno. Al guardar, los cambios se enviarán nuevamente a revisión según las reglas del sistema.
        </p>
      </div>

      {/* INDICADOR DE PASO */}
      <div className="mb-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#828d4b] transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-[#817d58]">
          Paso {step} de 6
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="min-h-[420px]">
        {step === 1 && (
          <InfoBasica formData={formData} setFormData={setFormData} />
        )}

        {step === 2 && (
          <UbicacionMapa formData={formData} setFormData={setFormData} />
        )}

        {step === 3 && (
          <CaracteristicasTerreno
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {step === 4 && (
          <InfoLegal formData={formData} setFormData={setFormData} />
        )}

        {step === 5 && (
          <ImagenesTerreno formData={formData} setFormData={setFormData} />
        )}

        {step === 6 && (
          <div className="rounded-xl border border-[#817d58]/20 bg-[#fafaf7] p-6">
            <h2 className="text-2xl font-semibold text-[#22341c]">
              Confirmar edición
            </h2>

            <p className="mt-2 text-sm text-[#817d58]">
              Revisa el resumen antes de guardar los cambios del terreno.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-[#22341c]">
              <p><b>Título:</b> {formData.titulo || "N/D"}</p>
              <p><b>Precio:</b> {formData.precio || "N/D"}</p>
              <p><b>Estado:</b> {formData.estado_region || "N/D"}</p>
              <p><b>Municipio:</b> {formData.municipio || "N/D"}</p>
              <p><b>Colonia:</b> {formData.colonia || "N/D"}</p>
              <p><b>Escritura:</b> {formData.escritura || "N/D"}</p>
              <p><b>Estatus legal:</b> {formData.estatus_legal || "N/D"}</p>
              <p><b>Imágenes existentes:</b> {formData.imagenesExistentes?.length || 0}</p>
              <p><b>Imágenes nuevas:</b> {formData.imagenes?.length || 0}</p>
              <p><b>Imágenes marcadas para eliminar:</b> {formData.imagenesEliminadas?.length || 0}</p>
              <p><b>Documentos existentes:</b> {formData.documentosExistentes?.length || 0}</p>
              <p><b>Documentos nuevos:</b> {formData.documentos?.length || 0}</p>
              <p><b>Documentos marcados para eliminar:</b> {formData.documentosEliminados?.length || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* NAVEGACIÓN */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1 || guardando}
          className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Atrás
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={next}
            disabled={guardando}
            className="rounded-xl bg-[#22341c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={guardarCambios}
            disabled={guardando}
            className="rounded-xl bg-[#22341c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        )}
      </div>
    </div>
  );
}