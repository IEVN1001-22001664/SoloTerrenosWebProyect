"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Tags,
  LandPlot,
  Map,
  FileSearch,
  Trash2,
  Star,
  Clock3,
  CreditCard,
  ReceiptText,
  History,
  MessageSquare,
  Bell,
  ShieldCheck,
  Settings,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  FolderKanban,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SidebarItem {
  label: string;
  href: string;
}

interface SidebarGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: SidebarItem[];
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}: AdminSidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    usuarios: true,
    publicaciones: true,
    suscripciones: true,
    operacion: false,
    sistema: false,
    cuenta: false,
  });

  const groups: SidebarGroup[] = useMemo(
    () => [
      {
        key: "usuarios",
        label: "Usuarios",
        icon: <Users size={18} />,
        items: [
          { label: "Lista general", href: "/admin/users" },
          { label: "Colaboradores", href: "/admin/users/colaboradores" },
          { label: "Clientes", href: "/admin/users/clientes" },
          { label: "Etiquetas", href: "/admin/users/etiquetas" },
        ],
      },
      {
        key: "publicaciones",
        label: "Publicaciones",
        icon: <LandPlot size={18} />,
        items: [
          { label: "Buscador", href: "/admin/publicaciones" },
          { label: "Pendientes", href: "/admin/publicaciones/pendientes" },
          { label: "Destacados", href: "/admin/publicaciones/destacados" },
          { label: "Mapa", href: "/admin/publicaciones/mapa" },
          { label: "Valuaciones", href: "/admin/publicaciones/valuaciones" },
          { label: "Borrados", href: "/admin/publicaciones/borrados" },
        ],
      },
      {
        key: "suscripciones",
        label: "Suscripciones",
        icon: <CreditCard size={18} />,
        items: [
          { label: "Vista general", href: "/admin/suscripciones" },
          { label: "Planes", href: "/admin/suscripciones/planes" },
          { label: "Trials", href: "/admin/suscripciones/trials" },
          { label: "Historial", href: "/admin/suscripciones/historial" },
        ],
      },
      {
        key: "operacion",
        label: "Operación",
        icon: <FolderKanban size={18} />,
        items: [
          { label: "Leads", href: "/admin/leads" },
          { label: "Conversaciones", href: "/admin/conversaciones" },
          { label: "Notificaciones", href: "/admin/notificaciones" },
        ],
      },
      {
        key: "sistema",
        label: "Sistema",
        icon: <ShieldCheck size={18} />,
        items: [
          { label: "Zonas", href: "/admin/zonas" },
          { label: "Tipos de terreno", href: "/admin/tipos" },
          { label: "Documentos legales", href: "/admin/documentos-legales" },
          { label: "Blog / recursos", href: "/admin/blog" },
        ],
      },
      {
        key: "cuenta",
        label: "Cuenta",
        icon: <UserCircle2 size={18} />,
        items: [
          { label: "Mi perfil", href: "/admin/perfil" },
          { label: "Configuración", href: "/admin/configuracion" },
        ],
      },
    ],
    []
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  const isExactActive = (path: string) => pathname === path;
  const isPathActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] border-r transition-all duration-300 ${
        collapsed ? "w-[88px]" : "w-[290px]"
      }`}
      style={{
        backgroundColor: "#0f172a",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex h-full flex-col">
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          {!collapsed ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
                Panel
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Admin CRM
              </h2>
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
              <LayoutDashboard size={18} />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-xl bg-white/10 p-2 text-white/90 transition hover:bg-white/20 hover:text-white"
            aria-label="Colapsar sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
              style={{
                backgroundColor: isExactActive("/admin") ? "#dbeafe" : "transparent",
                color: isExactActive("/admin") ? "#0f172a" : "#e2e8f0",
              }}
            >
              <LayoutDashboard size={18} />
              {!collapsed && <span>Dashboard</span>}
            </Link>

            <Link
              href="/admin/estadisticas"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
              style={{
                backgroundColor: isExactActive("/admin/estadisticas")
                  ? "#dbeafe"
                  : "transparent",
                color: isExactActive("/admin/estadisticas") ? "#0f172a" : "#e2e8f0",
              }}
            >
              <FileSearch size={18} />
              {!collapsed && <span>Estadísticas</span>}
            </Link>
          </div>

          <div className="my-4 border-t border-white/10" />

          <div className="space-y-2">
            {groups.map((group) => {
              const groupActive = group.items.some((item) =>
                isPathActive(item.href)
              );

              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                    style={{
                      backgroundColor: groupActive ? "rgba(255,255,255,0.06)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {group.icon}
                      {!collapsed && <span>{group.label}</span>}
                    </div>

                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          openGroups[group.key] ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!collapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openGroups[group.key] ? "max-h-[500px] pt-2" : "max-h-0"
                      }`}
                    >
                      <div className="ml-4 space-y-1 border-l border-white/10 pl-4">
                        {group.items.map((item) => {
                          const active = isPathActive(item.href);

                          const itemIcon =
                            item.href.includes("/colaboradores") ? (
                              <UserCog size={15} />
                            ) : item.href.includes("/clientes") ? (
                              <Users size={15} />
                            ) : item.href.includes("/etiquetas") ? (
                              <Tags size={15} />
                            ) : item.href.includes("/pendientes") ? (
                              <Clock3 size={15} />
                            ) : item.href.includes("/destacados") ? (
                              <Star size={15} />
                            ) : item.href.includes("/mapa") ? (
                              <Map size={15} />
                            ) : item.href.includes("/borrados") ? (
                              <Trash2 size={15} />
                            ) : item.href.includes("/planes") ? (
                              <ReceiptText size={15} />
                            ) : item.href.includes("/historial") ? (
                              <History size={15} />
                            ) : item.href.includes("/conversaciones") ? (
                              <MessageSquare size={15} />
                            ) : item.href.includes("/notificaciones") ? (
                              <Bell size={15} />
                            ) : item.href.includes("/configuracion") ? (
                              <Settings size={15} />
                            ) : (
                              <span className="h-[6px] w-[6px] rounded-full bg-blue-300" />
                            );

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition"
                              style={{
                                backgroundColor: active ? "#dbeafe" : "transparent",
                                color: active ? "#0f172a" : "#cbd5e1",
                              }}
                            >
                              {itemIcon}
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-red-500/10 hover:text-white"
          >
            <LogOut size={18} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}