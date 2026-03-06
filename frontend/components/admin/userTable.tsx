"use client";

import { useEffect, useState } from "react";

//----------------------------
// Codigo cambiado - Import apiFetch
//----------------------------
import { apiFetch } from "@/src/lib/api";
//----------------------------

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  suscripcion_activa: boolean;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);

  /* =========================
     Obtener usuarios
  ========================= */

  //----------------------------
  // Codigo cambiado - Eliminado localStorage y fetch manual
  //----------------------------
  const getUsers = async () => {
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data);
    } catch (error) {
      console.error("Error getUsers:", error);
    }
  };
  //----------------------------

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getUsers();
  }, []);

  /* =========================
     Actualizar Rol
  ========================= */

  //----------------------------
  // Codigo cambiado - Uso de apiFetch
  //----------------------------
  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol: newRole }),
      });

      await getUsers();
    } catch (error) {
      console.error("Error updateUserRole:", error);
    }
  };
  //----------------------------

  /* =========================
     Actualizar Suscripción
  ========================= */

  //----------------------------
  // Codigo cambiado - Uso de apiFetch
  //----------------------------
  const updateUserSubscription = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/subscription`, {
        method: "PUT",
        body: JSON.stringify({
          suscripcion_activa: !currentStatus,
        }),
      });

      await getUsers();
    } catch (error) {
      console.error("Error updateUserSubscription:", error);
    }
  };
  //----------------------------

  /* =========================
     Eliminar Usuario
  ========================= */

  //----------------------------
  // Codigo cambiado - Uso de apiFetch
  //----------------------------
  const removeUser = async (userId: number) => {
    const confirmDelete = confirm("¿Eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      await getUsers();
    } catch (error) {
      console.error("Error removeUser:", error);
    }
  };
  //----------------------------

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
          <tr>
            <th className="p-4">Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Suscripción</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-4">{user.nombre}</td>
              <td>{user.email}</td>

              <td>
                <select
                  value={user.rol}
                  onChange={(e) =>
                    updateUserRole(user.id, e.target.value)
                  }
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td>
                <button
                  onClick={() =>
                    updateUserSubscription(
                      user.id,
                      user.suscripcion_activa
                    )
                  }
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.suscripcion_activa
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.suscripcion_activa ? "Activa" : "Inactiva"}
                </button>
              </td>

              <td className="space-x-2">
                <button className="text-blue-600 hover:underline">
                  Editar
                </button>

                <button
                  onClick={() => removeUser(user.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}