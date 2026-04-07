"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  RefreshCw,
  Filter,
  AlertCircle,
} from "lucide-react";

interface User {
  id: number;
  nombre: string;
  apellido?: string | null;
  email: string;
  rol: string;
  puede_publicar: boolean;
  bloqueado_publicacion: boolean;
  colaborador_desde?: string | null;
  suscripcion_actual_id?: number | null;
  auto_aprobado?: boolean;
  suscripcion_estado?: string | null;
  suscripcion_origen?: string | null;
  suscripcion_fecha_inicio?: string | null;
  suscripcion_fecha_fin?: string | null;
  plan_codigo?: string | null;
  plan_nombre?: string | null;
}

type FiltroSuscripcion = "todos" | "con_suscripcion" | "sin_suscripcion";
type FiltroPublicacion = "todos" | "habilitados" | "bloqueados";

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroSuscripcion, setFiltroSuscripcion] =
    useState<FiltroSuscripcion>("todos");
  const [filtroPublicacion, setFiltroPublicacion] =
    useState<FiltroPublicacion>("todos");

  const [accionCargando, setAccionCargando] = useState<string | null>(null);

  const getUsers = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await apiFetch("/api/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error getUsers:", error);
      setError("No fue posible cargar los usuarios.");
      setUsers([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      setAccionCargando(`rol-${userId}`);

      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol: newRole }),
      });

      await getUsers();
    } catch (error) {
      console.error("Error updateUserRole:", error);
      setError("No fue posible actualizar el rol del usuario.");
    } finally {
      setAccionCargando(null);
    }
  };

  const removeUser = async (userId: number) => {
    const confirmDelete = confirm(
      "¿Eliminar este usuario? Esta acción puede ser irreversible."
    );
    if (!confirmDelete) return;

    try {
      setAccionCargando(`delete-${userId}`);

      await apiFetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      await getUsers();
    } catch (error) {
      console.error("Error removeUser:", error);
      setError("No fue posible eliminar el usuario.");
    } finally {
      setAccionCargando(null);
    }
  };

  const usersFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return users.filter((user) => {
      const nombreCompleto =
        `${user.nombre || ""} ${user.apellido || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const plan = (user.plan_nombre || "").toLowerCase();

      const coincideBusqueda =
        !q ||
        nombreCompleto.includes(q) ||
        email.includes(q) ||
        plan.includes(q);

      const coincideSuscripcion =
        filtroSuscripcion === "todos"
          ? true
          : filtroSuscripcion === "con_suscripcion"
          ? Boolean(user.suscripcion_actual_id)
          : !user.suscripcion_actual_id;

      const coincidePublicacion =
        filtroPublicacion === "todos"
          ? true
          : filtroPublicacion === "habilitados"
          ? user.puede_publicar
          : !user.puede_publicar || user.bloqueado_publicacion;

      return coincideBusqueda && coincideSuscripcion && coincidePublicacion;
    });
  }, [users, busqueda, filtroSuscripcion, filtroPublicacion]);

  const resumen = useMemo(() => {
    const total = users.length;
    const conSuscripcion = users.filter((u) => u.suscripcion_actual_id).length;
    const sinSuscripcion = total - conSuscripcion;
    const habilitados = users.filter((u) => u.puede_publicar).length;

    return {
      total,
      conSuscripcion,
      sinSuscripcion,
      habilitados,
    };
  }, [users]);

  const getEstadoSuscripcionBadge = (estado?: string | null) => {
    const e = (estado || "").toLowerCase();

    let classes = "bg-slate-100 text-slate-700";

    if (e === "activa" || e === "trialing") {
      classes = "bg-emerald-50 text-emerald-700";
    } else if (e === "pago_pendiente") {
      classes = "bg-amber-50 text-amber-700";
    } else if (e === "cancelada" || e === "vencida" || e === "suspendida") {
      classes = "bg-rose-50 text-rose-700";
    }

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
        {estado || "Sin suscripción"}
      </span>
    );
  };

  const getPublicacionBadge = (user: User) => {
    if (user.bloqueado_publicacion) {
      return (
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          Bloqueado
        </span>
      );
    }

    if (user.puede_publicar) {
      return (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Habilitado
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        Inactivo
      </span>
    );
  };

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "No disponible";

    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Usuarios
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gestión de usuarios base del sistema. Esta vista se enfoca en cuentas con rol usuario.
          </p>
        </div>

        <button
          onClick={getUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Usuarios totales</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">
                {resumen.total}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Con suscripción</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">
                {resumen.conSuscripcion}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Sin suscripción</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">
                {resumen.sinSuscripcion}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Publicación habilitada</p>
              <p className="mt-3 text-3xl font-bold text-slate-800">
                {resumen.habilitados}
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o plan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroSuscripcion}
              onChange={(e) =>
                setFiltroSuscripcion(e.target.value as FiltroSuscripcion)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            >
              <option value="todos">Todas las suscripciones</option>
              <option value="con_suscripcion">Con suscripción</option>
              <option value="sin_suscripcion">Sin suscripción</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroPublicacion}
              onChange={(e) =>
                setFiltroPublicacion(e.target.value as FiltroPublicacion)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
            >
              <option value="todos">Toda publicación</option>
              <option value="habilitados">Habilitados</option>
              <option value="bloqueados">Bloqueados/inactivos</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {cargando ? (
          <div className="p-6 text-sm text-slate-500">
            Cargando usuarios...
          </div>
        ) : usersFiltrados.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No se encontraron usuarios con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Usuario</th>
                  <th className="px-4 py-4">Rol</th>
                  <th className="px-4 py-4">Suscripción</th>
                  <th className="px-4 py-4">Plan</th>
                  <th className="px-4 py-4">Publicación</th>
                  <th className="px-4 py-4">Vigencia</th>
                  <th className="px-4 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usersFiltrados.map((user) => {
                  const nombreCompleto = `${user.nombre || ""} ${user.apellido || ""}`.trim();
                  const cargandoRol = accionCargando === `rol-${user.id}`;
                  const cargandoDelete = accionCargando === `delete-${user.id}`;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        #{user.id}
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {nombreCompleto || "Sin nombre"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={user.rol}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={cargandoRol}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <option value="usuario">Usuario</option>
                          <option value="colaborador">Colaborador</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        {getEstadoSuscripcionBadge(user.suscripcion_estado)}
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {user.plan_nombre || "Sin plan"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.suscripcion_origen || "No disponible"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">{getPublicacionBadge(user)}</td>

                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-700">
                          {formatearFecha(user.suscripcion_fecha_fin)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => removeUser(user.id)}
                            disabled={cargandoDelete}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 className="h-4 w-4" />
                            {cargandoDelete ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}