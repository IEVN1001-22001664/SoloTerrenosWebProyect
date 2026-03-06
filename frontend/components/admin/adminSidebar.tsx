"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LandPlot,
  ChevronDown,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [openUsers, setOpenUsers] = useState(true);
  const [openPublicaciones, setOpenPublicaciones] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const isActive = (path: string) =>
    pathname === path ? "text-blue-400" : "text-gray-300";

  return (
    <div
      className={`h-[calc(100vh-4rem)] bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <h1 className="font-bold text-lg">Admin CRM</h1>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        {/* Dashboard */}
        <Link
          href="/admin"
          className={`flex items-center gap-3 hover:text-blue-400 transition ${isActive(
            "/admin"
          )}`}
        >
          <LayoutDashboard size={20} />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* ================= USUARIOS ================= */}
        <div>
          <button
            onClick={() => setOpenUsers(!openUsers)}
            className="flex items-center justify-between w-full hover:text-blue-400 transition"
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              {!collapsed && <span>Usuarios</span>}
            </div>

            {!collapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  openUsers ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Submenu */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openUsers && !collapsed ? "max-h-40 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-8 flex flex-col gap-2 text-sm">

              <Link
                href="/admin/users"
                className={`hover:text-blue-400 transition ${isActive(
                  "/admin/users"
                )}`}
              >
                Lista
              </Link>

              <Link
                href="/admin/users/colaboradores"
                className={`hover:text-blue-400 transition ${isActive(
                  "/admin/users/colaboradores"
                )}`}
              >
                Colaboradores
              </Link>

              <Link
                href="/admin/users/etiquetas"
                className={`hover:text-blue-400 transition ${isActive(
                  "/admin/users/etiquetas"
                )}`}
              >
                Etiquetas
              </Link>

            </div>
          </div>
        </div>

        {/* ================= PUBLICACIONES ================= */}
        <div>
          <button
            onClick={() => setOpenPublicaciones(!openPublicaciones)}
            className="flex items-center justify-between w-full hover:text-blue-400 transition"
          >
            <div className="flex items-center gap-3">
              <LandPlot size={20} />
              {!collapsed && <span>Publicaciones</span>}
            </div>

            {!collapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  openPublicaciones ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openPublicaciones && !collapsed ? "max-h-52 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-8 flex flex-col gap-2 text-sm">

              <Link
                href="/admin/publicaciones"
                className={`hover:text-blue-400 transition ${isActive(
                  "/admin/publicaciones"
                )}`}
              >
                Buscador
              </Link>

              <Link
                href="/admin/publicaciones/mapa"
                className="hover:text-blue-400 transition"
              >
                Mapa
              </Link>

              <Link
                href="/admin/publicaciones/valuaciones"
                className="hover:text-blue-400 transition"
              >
                Valuaciones
              </Link>

              <Link
                href="/admin/publicaciones/borrados"
                className="hover:text-blue-400 transition"
              >
                Borrados
              </Link>

            </div>
          </div>
        </div>

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 hover:text-red-400 transition"
        >
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}