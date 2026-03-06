"use client";

import { useEffect, useState } from "react";

//----------------------------
// Codigo cambiado - Import apiFetch
//----------------------------
import { apiFetch } from "@/src/lib/api";
//----------------------------

interface Terreno {
  id: number;
  titulo: string;
  precio: number;
  estado: string;
}

export default function BorradosPage() {
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"restore" | "delete" | null>(null);

  //----------------------------
  // Codigo cambiado - Eliminado localStorage y Authorization
  //----------------------------
  const fetchBorrados = async () => {
    try {
      const data = await apiFetch("/api/admin/publicaciones/borrados");

      if (Array.isArray(data)) {
        setTerrenos(data);
      } else if (Array.isArray(data.publicaciones)) {
        setTerrenos(data.publicaciones);
      } else {
        setTerrenos([]);
      }
    } catch (error) {
      console.error("Error cargando borrados", error);
      setTerrenos([]);
    } finally {
      setLoading(false);
    }
  };
  //----------------------------

  useEffect(() => {
    fetchBorrados();
  }, []);

  const openModal = (id: number, type: "restore" | "delete") => {
    setSelectedId(id);
    setActionType(type);
    setModalOpen(true);
  };

  //----------------------------
  // Codigo cambiado - Eliminado token manual y headers Authorization
  //----------------------------
  const handleConfirm = async () => {
    if (!selectedId || !actionType) return;

    try {
      if (actionType === "restore") {
        await apiFetch(
          `/api/admin/publicaciones/${selectedId}/restaurar`,
          {
            method: "PUT",
          }
        );
      } else {
        await apiFetch(
          `/api/admin/publicaciones/${selectedId}/definitivo`,
          {
            method: "DELETE",
          }
        );
      }

      fetchBorrados();
    } catch (error) {
      console.error("Error ejecutando acción", error);
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setActionType(null);
    }
  };
  //----------------------------

  if (loading) {
    return <div className="p-6">Cargando publicaciones borradas...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Publicaciones Borradas</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3">Título</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {terrenos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  No hay publicaciones eliminadas.
                </td>
              </tr>
            )}

            {terrenos.map((terreno) => (
              <tr key={terreno.id} className="border-t">
                <td className="px-6 py-4">{terreno.titulo}</td>
                <td className="px-6 py-4">
                  ${terreno.precio.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                    {terreno.estado}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => openModal(terreno.id, "restore")}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Restaurar
                  </button>

                  <button
                    onClick={() => openModal(terreno.id, "delete")}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar definitivo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              ¿Estás seguro?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {actionType === "restore"
                ? "Esta publicación será restaurada."
                : "Esta acción eliminará la publicación permanentemente."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm text-white rounded ${
                  actionType === "restore"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}