"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MapComponent = dynamic(
  () => import("../../components/maps/MapComponent"),
  { ssr: false }
);

function PublicarPage() {

  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipo, setTipo] = useState("");
  const [poligono, setPoligono] = useState<number[][] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poligono || poligono.length === 0) {
      alert("Debes dibujar el terreno en el mapa");
      return;
    }

    try {
      console.log("POLIGONO A ENVIAR:", poligono);
      console.log("TIPO:", typeof poligono);

      const response = await fetch("http://localhost:5000/api/terrenos", {
        method: "POST",
        credentials: "include", // 🔐 enviar cookie httpOnly
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          precio: parseFloat(precio),
          ubicacion,
          tipo,
          poligono,
        }),
      });

      if (!response.ok) {
        alert("Error al publicar terreno");
        return;
      }

      alert("Terreno publicado correctamente");
      router.push("/misTerrenos");

    } catch (error) {

      console.error(error);
      alert("Error de conexión");

    }
  };

  return (

    <main className="min-h-screen bg-[#f4f7fa] flex justify-center p-10">

      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-10">

        <h1 className="text-3xl font-bold text-[#003554] mb-8">
          Publicar Terreno
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >

          {/* TITULO */}
          <input
            type="text"
            placeholder="Título del terreno"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="border p-3 rounded-lg"
          />

          {/* DESCRIPCIÓN */}
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="border p-3 rounded-lg h-32"
          />

          {/* PRECIO */}
          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            className="border p-3 rounded-lg"
          />

          {/* UBICACION */}
          <input
            type="text"
            placeholder="Ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            required
            className="border p-3 rounded-lg"
          />

          {/* TIPO */}
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            className="border p-3 rounded-lg"
          >
            <option value="">Tipo de terreno</option>
            <option value="habitacional">Habitacional</option>
            <option value="comercial">Comercial</option>
            <option value="urbano">Urbano</option>
            <option value="inversion">Inversión</option>
            <option value="agricola">Agrícola</option>
            <option value="industrial">Industrial</option>
          </select>

          {/* MAPA */}
          <div>

            <h2 className="font-semibold text-[#003554] mb-2">
              Dibujar terreno en el mapa
            </h2>

            <div className="h-[450px] border rounded-lg overflow-hidden">

              <MapComponent onPolygonChange={setPoligono} />

            </div>

          </div>

          {/* BOTON */}
          <button
            type="submit"
            className="bg-[#426C8E] text-white p-3 rounded-lg hover:bg-[#003554] transition"
          >
            Publicar Terreno
          </button>

        </form>

      </div>

    </main>

  );
}

export default function PublicarWrapper() {
  return (
    <ProtectedRoute allowedRoles={["admin", "colaborador"]}>
      <PublicarPage />
    </ProtectedRoute>
  );
}