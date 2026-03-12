"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapViewer = dynamic(
  () => import("@/components/maps/MapViewer"),
  { ssr: false }
);
interface Props {
  formData: any;
}

export default function confirmacion({ formData }: Props) {

  const router = useRouter();
  const [publicando, setPublicando] = useState(false);

  /* ============================= */
  /* PUBLICAR TERRENO             */
  /* ============================= */

  const publicarTerreno = async () => {

    try {

      setPublicando(true);

      /* --------------------------- */
      /* CREAR TERRENO               */
      /* --------------------------- */

      const response = await fetch(
        "http://localhost:5000/api/terrenos",
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
      /* SUBIR IMAGENES              */
      /* --------------------------- */

      if (formData.imagenes && formData.imagenes.length > 0) {

        const formDataImagenes = new FormData();

        formData.imagenes.forEach((img: any) => {

          formDataImagenes.append("imagenes", img);

        });

        await fetch(
          `http://localhost:5000/api/terrenos/${terrenoId}/imagenes`,
          {
            method: "POST",
            credentials: "include",
            body: formDataImagenes,
          }
        );

      }

      /* --------------------------- */
      /* REDIRECCION                 */
      /* --------------------------- */

      alert("Terreno publicado correctamente");

      router.push("/misTerrenos");

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
          Revisa la información antes de publicar el terreno.
        </p>

      </div>


      {/* RESUMEN DE INFORMACION */}

      <div className="border border-[#817d58]/30 rounded-xl p-6">

        <h3 className="font-semibold text-[#22341c] mb-4">
          Información básica
        </h3>

        <p><b>Título:</b> {formData.titulo}</p>
        <p><b>Precio:</b> ${formData.precio}</p>
        <p><b>Tipo:</b> {formData.tipo}</p>

      </div>


      {/* UBICACION */}

      <div className="border border-[#817d58]/30 rounded-xl p-6">

        <h3 className="font-semibold text-[#22341c] mb-4">
          Ubicación
        </h3>

        <p><b>Estado:</b> {formData.estado_region}</p>
        <p><b>Municipio:</b> {formData.municipio}</p>
        <p><b>Dirección:</b> {formData.direccion}</p>
        <p><b>Colonia:</b> {formData.colonia}</p>
        <p><b>Código postal:</b> {formData.codigo_postal}</p>

        {formData.poligono && (
          <>
            <p><b>Área:</b> {Math.round(formData.poligono.area)} m²</p>
            <p><b>Perímetro:</b> {Math.round(formData.poligono.perimeter)} m</p>
          </>
        )}

      </div>

      {/* MAPA DEL TERRENO */}

            {formData.poligono && (

            <div className="border border-[#817d58]/30 rounded-xl p-6">

                <h3 className="font-semibold text-[#22341c] mb-4">
                Ubicación del terreno
                </h3>

                <div className="h-[400px] rounded-lg overflow-hidden">

                <MapViewer
                    polygon={formData.poligono.polygon}
                    center={formData.poligono.center}
                />

                </div>

            </div>

            )}


      {/* BOTON PUBLICAR */}

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