"use client";

import { useEffect, useState } from "react";

//----------------------------
// Codigo cambiado - Import apiFetch
//----------------------------
import { apiFetch } from "@/src/lib/api";
//----------------------------

interface Colaborador {
  id: number;
  nombre: string;
  publicaciones: number;
  suscripcion: string;
  auto_aprobado: boolean;
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColaboradores();
  }, []);

  //----------------------------
  // Codigo cambiado - Eliminado localStorage y fetch manual
  //----------------------------
  const fetchColaboradores = async () => {
    try {
      const data = await apiFetch("/api/admin/colaboradores");
      setColaboradores(data);
    } catch (error) {
      console.error("Error cargando colaboradores", error);
    } finally {
      setLoading(false);
    }
  };
  //----------------------------

  //----------------------------
  // Codigo cambiado - Eliminado token manual y headers
  //----------------------------
  const toggleAutoAprobado = async (id: number, currentValue: boolean) => {
    try {
      await apiFetch(`/api/admin/usuarios/${id}/auto-aprobado`, {
        method: "PUT",
        body: JSON.stringify({
          auto_aprobado: !currentValue,
        }),
      });

      // Actualizar estado local
      setColaboradores((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, auto_aprobado: !currentValue } : c
        )
      );
    } catch (error) {
      console.error("Error actualizando auto-aprobado", error);
    }
  };
  //----------------------------

  if (loading) {
    return <div>Cargando colaboradores...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Gestión de Colaboradores
      </h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Publicaciones</th>
              <th className="p-3">Suscripción</th>
              <th className="p-3">AutoAprobado</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((col) => (
              <tr
                key={col.id}
                className="border-b hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="p-3">{col.id}</td>
                <td className="p-3">{col.nombre}</td>
                <td className="p-3">{col.publicaciones}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      col.suscripcion === "Premium"
                        ? "bg-yellow-100 text-yellow-700"
                        : col.suscripcion === "Pro"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {col.suscripcion}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() =>
                      toggleAutoAprobado(col.id, col.auto_aprobado)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                      col.auto_aprobado ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        col.auto_aprobado ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
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