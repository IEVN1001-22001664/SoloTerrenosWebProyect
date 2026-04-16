"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  Plus,
  SearchCheck,
  Settings,
} from "lucide-react";
import SearchBar from "./searchBar";
import ProfileMenu from "./profileMenu";

type RouteMeta = {
  title: string;
  section: string;
  description: string;
};

const ROUTE_META: Array<{
  match: (pathname: string) => boolean;
  meta: RouteMeta;
}> = [
  {
    match: (pathname) => pathname === "/admin",
    meta: {
      title: "Dashboard Ejecutivo",
      section: "Resumen general",
      description: "Monitorea operacion, publicaciones, usuarios y suscripciones.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/users"),
    meta: {
      title: "Gestion de Usuarios",
      section: "Usuarios",
      description: "Administra clientes, colaboradores y segmentacion operativa.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/publicaciones"),
    meta: {
      title: "Control de Publicaciones",
      section: "Publicaciones",
      description: "Revisa inventario, moderacion, destacados y mapa operativo.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/suscripciones"),
    meta: {
      title: "Suscripciones y Planes",
      section: "Ingresos",
      description: "Supervisa planes, trials, historiales y estatus comerciales.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/leads"),
    meta: {
      title: "Pipeline de Leads",
      section: "Operacion",
      description: "Da seguimiento a oportunidades, conversion y respuesta comercial.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/conversaciones"),
    meta: {
      title: "Conversaciones",
      section: "Operacion",
      description: "Consulta actividad reciente entre compradores y colaboradores.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/notificaciones"),
    meta: {
      title: "Centro de Notificaciones",
      section: "Operacion",
      description: "Controla alertas del sistema y eventos relevantes del marketplace.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/admin/estadisticas"),
    meta: {
      title: "Estadisticas",
      section: "Analitica",
      description: "Visualiza tendencias, desempeno de contenido y actividad comercial.",
    },
  },
];

function getRouteMeta(pathname: string): RouteMeta {
  return (
    ROUTE_META.find((route) => route.match(pathname))?.meta ?? {
      title: "Panel Administrativo",
      section: "Admin CRM",
      description: "Gestion centralizada del ecosistema SoloTerrenos.",
    }
  );
}

export default function AdminTopbar() {
  const pathname = usePathname();

  const routeMeta = useMemo(() => getRouteMeta(pathname), [pathname]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    []
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200/80 bg-white/92 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex h-full items-stretch">
        <div className="flex w-[290px] shrink-0 items-center border-r border-slate-200 bg-white px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3e4]">
              <Image
                src="/images/IconoST.png"
                alt="SoloTerrenos"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8a62]">
                SoloTerrenos
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                Admin CRM
              </p>
            </div>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <div className="hidden xl:flex xl:min-w-0 xl:flex-col">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>{routeMeta.section}</span>
                <ChevronRight size={12} />
                <span className="truncate text-slate-700">{routeMeta.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="truncate text-lg font-semibold text-slate-950">
                  {routeMeta.title}
                </h1>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 2xl:inline-block" />
                <p className="hidden truncate text-sm text-slate-500 2xl:block">
                  {routeMeta.description}
                </p>
              </div>
            </div>

            <div className="hidden max-w-xl flex-1 lg:block">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 xl:flex">
              <Clock3 size={14} className="text-[#7d8a62]" />
              <span className="capitalize">{todayLabel}</span>
            </div>

            <Link
              href="/publicar"
              className="hidden items-center gap-2 rounded-2xl bg-[#22341c] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#2f4727] lg:inline-flex"
            >
              <Plus size={16} />
              Nueva publicacion
            </Link>

            <Link
              href="/"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 xl:inline-flex"
            >
              <ExternalLink size={16} />
              Ver sitio
            </Link>

            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Busqueda avanzada"
            >
              <SearchCheck size={18} />
            </button>

            <button
              type="button"
              className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Notificaciones"
            >
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#9f885c] px-1 text-[10px] font-semibold text-white">
                3
              </span>
            </button>

            <Link
              href="/admin"
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>

            <Link
              href="/admin/configuracion"
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              title="Configuracion"
            >
              <Settings size={18} />
            </Link>

            <div className="ml-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
