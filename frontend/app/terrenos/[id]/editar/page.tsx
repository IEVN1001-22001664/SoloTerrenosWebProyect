"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Terreno {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  tipo: string;
  poligono: number[][];
}

export default function EditarTerreno() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<Terreno | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/terrenos/${id}`)
      .then(res => res.json())
      .then(data => setFormData(data));
  }, [id]);

  if (!formData) return <p className="p-10">Cargando...</p>;

    const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setFormData((prev) =>
    prev
      ? {
          ...prev,
          [name]: name === "precio" ? Number(value) : value,
        }
      : prev
  );
};
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("ENVIANDO:", formData);

  const res = await fetch(`http://localhost:5000/api/terrenos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  console.log("RESPUESTA:", await res.json());

  router.push(`/terrenos/${id}`);
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Terreno</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="text"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Guardar Cambios
        </button>

      </form>
    </div>
  );
}
