"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../../components/maps/MapComponent"),
  { ssr: false }
);

export default function PublicarPage() {
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

    console.log("POLIGONO ANTES DE ENVIAR:", poligono);


    console.log("Datos enviados:", {
    titulo,
    precio,
    poligono
});
    console.log(typeof parseFloat(precio));

    try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("No estás autenticado");
          return;
        }

        const response = await fetch("http://localhost:5000/api/terrenos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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
      router.push("/terrenos");
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-8">
        Publicar un Terreno
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-5xl">

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Ubicación"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
          className="border p-2 rounded"
        />

        {/* 🔥 MAPA */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">
            Dibuja el polígono del terreno:
          </h2>
          <MapComponent onPolygonChange={setPoligono} />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded mt-4"
        >
          Publicar
        </button>

      </form>
    </main>
  );
}
