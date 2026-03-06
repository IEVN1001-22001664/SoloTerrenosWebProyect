"use client";

import { useEffect, useState } from "react";

//----------------------------
// Codigo cambiado - IMPORT apiFetch
//----------------------------
import { apiFetch } from "@/src/lib/api";
//----------------------------

interface Publicacion {
  id: number;
  titulo: string;
  estado: string;
  usuario: string;
}

export default function PublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        //----------------------------
        // Codigo cambiado - Eliminado localStorage y Authorization
        //----------------------------
        const data = await apiFetch("/api/admin/publicaciones");
        //----------------------------
        setPublicaciones(data);
      } catch (error) {
        console.error("Error cargando publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {

    //----------------------------
    // Codigo cambiado - Eliminado token y headers manuales
    //----------------------------
    await apiFetch(`/api/admin/publicaciones/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    //----------------------------

    setPublicaciones((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: nuevoEstado } : p
      )
    );
  };

  const eliminarPublicacion = async (id: number) => {

    //----------------------------
    // Codigo cambiado - Eliminado token y Authorization
    //----------------------------
    await apiFetch(`/api/admin/publicaciones/${id}`, {
      method: "DELETE",
    });
    //----------------------------

    setPublicaciones((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administrar Publicaciones</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Título</th>
              <th className="p-3 border">Usuario</th>
              <th className="p-3 border">Estado</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {publicaciones.map((pub) => (
              <tr key={pub.id} className="text-center">
                <td className="p-3 border">{pub.id}</td>
                <td className="p-3 border">{pub.titulo}</td>
                <td className="p-3 border">{pub.usuario}</td>
                <td
                  className={`p-3 border font-semibold ${
                    pub.estado === "aprobado"
                      ? "text-green-600"
                      : pub.estado === "rechazado"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {pub.estado}
                </td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => cambiarEstado(pub.id, "aprobado")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Aprobar
                  </button>

                  <button
                    onClick={() => cambiarEstado(pub.id, "rechazado")}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Rechazar
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de eliminar esta publicación?")) {
                        eliminarPublicacion(pub.id);
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}