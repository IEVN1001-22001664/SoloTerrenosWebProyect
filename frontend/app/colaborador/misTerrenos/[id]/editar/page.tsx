"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditarForm from "@/components/editarTerreno/editarForm";

export default function EditarTerrenoPage() {
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerTerreno = async () => {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/terrenos/${id}/editar`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "No se pudo cargar el terreno.");
          return;
        }

        setFormData({
          titulo: data.titulo || "",
          descripcion: data.descripcion || "",
          precio: data.precio ? String(data.precio) : "",
          tipo: data.tipo || "",
          negociable: data.negociable || false,

          codigo_postal: data.codigo_postal || "",
          estado_region: data.estado_region || "",
          municipio: data.municipio || "",
          colonia: data.colonia || "",
          direccion: data.direccion || "",

          topografia: data.topografia || "",
          forma: data.forma || "",
          uso_suelo: data.uso_suelo || "",
          tipo_propiedad: data.tipo_propiedad || "",

          escritura: data.escritura || "",
          estatus_legal: data.estatus_legal || "",
          gravamen: data.gravamen || false,

          poligono: data.poligono || null,
          mapCenter: data.poligono?.center || null,
          tipoMapa: "osm",

          latitud_manual: "",
          longitud_manual: "",

          imagenes: [],
          imagenesExistentes: data.imagenes || [],
          imagenesEliminadas: [],

          documentos: [],
          documentosExistentes: data.documentos || [],
          documentosEliminados: [],
        });
      } catch (error) {
        console.error("Error cargando terreno para editar:", error);
        setError("Error de conexión al cargar el terreno.");
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      obtenerTerreno();
    }
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#f8f8f5] px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#817d58]/20 bg-white p-10 text-center text-[#817d58] shadow-sm">
          Cargando terreno...
        </div>
      </main>
    );
  }

  if (error || !formData) {
    return (
      <main className="min-h-screen bg-[#f8f8f5] px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600 shadow-sm">
          {error || "No se encontró el terreno."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <EditarForm
          terrenoId={id}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </main>
  );
}