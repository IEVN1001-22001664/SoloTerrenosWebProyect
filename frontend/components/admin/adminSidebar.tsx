"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileSearch,
  FolderKanban,
  History,
  LandPlot,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
  UserCircle2,
  UserCog,
  Users,
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

const baseGroups: SidebarGroup[] = [
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
    label: "Operacion",
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
      { label: "Configuracion", href: "/admin/configuracion" },
    ],
  },
];

const topLevelLinks = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Estadisticas",
    href: "/admin/estadisticas",
    icon: <FileSearch size={18} />,
  },
];

function getItemIcon(href: string) {
  if (href.includes("/colaboradores")) return <UserCog size={15} />;
  if (href.includes("/clientes")) return <Users size={15} />;
  if (href.includes("/etiquetas")) return <Tags size={15} />;
  if (href.includes("/pendientes")) return <Clock3 size={15} />;
  if (href.includes("/destacados")) return <Star size={15} />;
  if (href.includes("/mapa")) return <Map size={15} />;
  if (href.includes("/borrados")) return <Trash2 size={15} />;
  if (href.includes("/planes")) return <ReceiptText size={15} />;
  if (href.includes("/historial")) return <History size={15} />;
  if (href.includes("/conversaciones")) return <MessageSquare size={15} />;
  if (href.includes("/notificaciones")) return <Bell size={15} />;
  if (href.includes("/configuracion")) return <Settings size={15} />;
  return <span className="h-[6px] w-[6px] rounded-full bg-[#8da065]" />;
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
  const [openPopoverGroup, setOpenPopoverGroup] = useState<string | null>(null);

  const groups = useMemo(() => baseGroups, []);

  useEffect(() => {
    setOpenPopoverGroup(null);
  }, [pathname, collapsed]);

  const isExactActive = (path: string) => pathname === path;
  const isPathActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  const toggleGroup = (groupKey: string) => {
    if (collapsed) {
      setOpenPopoverGroup((prev) => (prev === groupKey ? null : groupKey));
      return;
    }

    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200 bg-[#0f172a] transition-all duration-300 ${
        collapsed ? "w-[92px]" : "w-[290px]"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-4 py-4">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                  Navegacion
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Admin CRM
                </h2>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-2xl bg-white/10 p-2 text-slate-100 transition hover:bg-white/15 hover:text-white"
              aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {topLevelLinks.map((link) => {
              const active = isExactActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    collapsed ? "justify-center" : "gap-3"
                  }`}
                  style={{
                    backgroundColor: active ? "#dbeafe" : "transparent",
                    color: active ? "#0f172a" : "#e2e8f0",
                  }}
                >
                  {link.icon}
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-white/10" />

          <div className="space-y-2">
            {groups.map((group) => {
              const groupActive = group.items.some((item) => isPathActive(item.href));
              const groupOpen = openGroups[group.key];
              const popoverOpen = openPopoverGroup === group.key;

              return (
                <div key={group.key} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    title={collapsed ? group.label : undefined}
                    className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium transition ${
                      collapsed ? "justify-center" : "justify-between"
                    }`}
                    style={{
                      backgroundColor: groupActive ? "rgba(255,255,255,0.08)" : "transparent",
                      color: "#e2e8f0",
                    }}
                  >
                    <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                      {group.icon}
                      {!collapsed && <span>{group.label}</span>}
                    </div>

                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${
                          groupOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!collapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        groupOpen ? "max-h-[420px] pt-2" : "max-h-0"
                      }`}
                    >
                      <div className="ml-4 space-y-1 border-l border-white/10 pl-4">
                        {group.items.map((item) => {
                          const active = isPathActive(item.href);

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
                              {getItemIcon(item.href)}
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {collapsed && popoverOpen && (
                    <div className="absolute left-[calc(100%+12px)] top-0 z-30 w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {group.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Accesos rapidos del modulo
                        </p>
                      </div>

                      <div className="p-2">
                        {group.items.map((item) => {
                          const active = isPathActive(item.href);

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-50"
                              style={{
                                backgroundColor: active ? "#eef4ff" : "transparent",
                                color: active ? "#0f172a" : "#334155",
                              }}
                            >
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                  active ? "bg-[#dbeafe]" : "bg-slate-100"
                                }`}
                              >
                                {getItemIcon(item.href)}
                              </span>
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
            title={collapsed ? "Cerrar sesion" : undefined}
            className={`flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-red-500/10 hover:text-white ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
