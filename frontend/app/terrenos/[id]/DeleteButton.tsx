"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = confirm("¿Estás seguro de eliminar este terreno?");
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:5000/api/terrenos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.replace("/terrenos");
    } else {
      alert("Error al eliminar terreno");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="ml-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      Eliminar
    </button>
  );
}