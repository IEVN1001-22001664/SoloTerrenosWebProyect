"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PreviewImagenes from "./previewImagenes";

const MapViewer = dynamic(
  () => import("@/components/maps/MapViewer"),
  { ssr: false }
);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
interface Props {
  formData: any;
}

export default function Confirmacion({ formData }: Props) {
  const router = useRouter();
  const [publicando, setPublicando] = useState(false);

  /* ============================= */
  /* FORMATEAR TAMAÑO ARCHIVO      */
  /* ============================= */
  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ============================= */
  /* PUBLICAR TERRENO              */
  /* ============================= */
  const publicarTerreno = async () => {
    try {
      setPublicando(true);

      /* --------------------------- */
      /* CREAR TERRENO               */
      /* --------------------------- */
      const response = await fetch(
        `${API_URL}/api/terrenos`,
        {
          method: "POST",
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
              formData.estado_region
            ].filter(Boolean).join(", "),
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
            gravamen: formData.gravamen
          }),
        }
      );

      if (!response.ok) {
        alert("Error al publicar terreno");
        setPublicando(false);
        return;
      }

      const data = await response.json();
      const terrenoId = data.id;

      /* --------------------------- */
      /* SUBIR IMÁGENES              */
      /* --------------------------- */
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
          alert("El terreno se creó, pero hubo un error al subir las imágenes.");
          setPublicando(false);
          return;
        }
      }

      /* --------------------------- */
      /* SUBIR DOCUMENTOS LEGALES    */
      /* --------------------------- */
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
          alert("El terreno se creó, pero hubo un error al subir los documentos legales.");
          setPublicando(false);
          return;
        }
      }

      /* --------------------------- */
      /* REDIRECCIÓN                 */
      /* --------------------------- */
      alert("Terreno publicado correctamente");
      router.push("/colaborador/misTerrenos");

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
      setPublicando(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* TITULO */}
      <div>
        <h2 className="text-2xl font-semibold text-[#22341c]">
          Confirmar publicación
        </h2>

        <p className="text-sm text-[#817d58]">
          Revisa toda la información antes de publicar el terreno.
        </p>
      </div>

      {/* INFORMACIÓN BÁSICA */}
      <div className="border border-[#817d58]/30 rounded-xl p-6">
        <h3 className="font-semibold text-[#22341c] mb-4">
          Información básica
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <p><b>Título:</b> {formData.titulo || "No definido"}</p>
          <p><b>Precio:</b> ${formData.precio || "0"}</p>
          <p><b>Tipo:</b> {formData.tipo || "No definido"}</p>
          <p><b>Negociable:</b> {formData.negociable ? "Sí" : "No"}</p>
        </div>

        {formData.descripcion && (
          <div className="mt-4">
            <p className="font-medium text-[#22341c] mb-1">Descripción</p>
            <p className="text-sm text-[#817d58] whitespace-pre-line">
              {formData.descripcion}
            </p>
          </div>
        )}
      </div>

      {/* UBICACIÓN */}
      <div className="border border-[#817d58]/30 rounded-xl p-6">
        <h3 className="font-semibold text-[#22341c] mb-4">
          Ubicación
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <p><b>Estado:</b> {formData.estado_region || "No definido"}</p>
          <p><b>Municipio:</b> {formData.municipio || "No definido"}</p>
          <p><b>Colonia:</b> {formData.colonia || "No definida"}</p>
          <p><b>Código postal:</b> {formData.codigo_postal || "No definido"}</p>
          <p className="md:col-span-2"><b>Referencia:</b> {formData.direccion || "No definida"}</p>
        </div>

        {formData.poligono && (
          <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
            <p><b>Área:</b> {Math.round(formData.poligono.area)} m²</p>
            <p><b>Perímetro:</b> {Math.round(formData.poligono.perimeter)} m</p>
            <p>
              <b>Centro:</b>{" "}
              {formData.poligono.center[0].toFixed(6)}, {formData.poligono.center[1].toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* MAPA DEL TERRENO */}
      {formData.poligono && (
        <div className="border border-[#817d58]/30 rounded-xl p-6">
          <h3 className="font-semibold text-[#22341c] mb-4">
            Polígono del terreno
          </h3>

          <div className="h-[400px] rounded-lg overflow-hidden">
            <MapViewer
              polygon={formData.poligono.polygon}
              center={formData.poligono.center}
            />
          </div>
        </div>
      )}

      {/* CARACTERÍSTICAS */}
      <div className="border border-[#817d58]/30 rounded-xl p-6">
        <h3 className="font-semibold text-[#22341c] mb-4">
          Características del terreno
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <p><b>Topografía:</b> {formData.topografia || "No definida"}</p>
          <p><b>Forma:</b> {formData.forma || "No definida"}</p>
          <p><b>Tipo de propiedad:</b> {formData.tipo_propiedad || "No definido"}</p>
          <p><b>Uso de suelo:</b> {formData.uso_suelo || "No definido"}</p>
        </div>
      </div>

      {/* INFORMACIÓN LEGAL */}
      <div className="border border-[#817d58]/30 rounded-xl p-6">
        <h3 className="font-semibold text-[#22341c] mb-4">
          Información legal
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <p><b>Escritura:</b> {formData.escritura || "No definida"}</p>
          <p><b>Estatus legal:</b> {formData.estatus_legal || "No definido"}</p>
          <p><b>Gravamen:</b> {formData.gravamen ? "Sí" : "No"}</p>
        </div>

        {/* DOCUMENTOS */}
        <div className="mt-5">
          <p className="font-medium text-[#22341c] mb-3">
            Documentos cargados
          </p>

          {formData.documentos && formData.documentos.length > 0 ? (
            <div className="flex flex-col gap-3">
              {formData.documentos.map((archivo: File, index: number) => (
                <div
                  key={`${archivo.name}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-[#817d58]/25 bg-[#fafaf7] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#22341c]">
                      {archivo.name}
                    </p>
                    <p className="text-xs text-[#817d58]">
                      {archivo.type || "Documento"} · {formatearTamano(archivo.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#817d58]">
              No se cargaron documentos legales.
            </p>
          )}
        </div>
      </div>

      {/* IMÁGENES */}
      <div className="border border-[#817d58]/30 rounded-xl p-6">
        <h3 className="font-semibold text-[#22341c] mb-4">
          Imágenes cargadas
        </h3>

        {formData.imagenes && formData.imagenes.length > 0 ? (
          <PreviewImagenes
            imagenes={formData.imagenes}
            soloVista={true}
          />
        ) : (
          <p className="text-sm text-[#817d58]">
            No se cargaron imágenes.
          </p>
        )}
      </div>

      {/* BOTÓN PUBLICAR */}
      <button
        onClick={publicarTerreno}
        disabled={publicando}
        className="bg-[#22341c] text-white p-4 rounded-lg hover:bg-[#828d4b] transition font-semibold"
      >
        {publicando ? "Publicando..." : "Publicar terreno"}
      </button>
    </div>
  );
}