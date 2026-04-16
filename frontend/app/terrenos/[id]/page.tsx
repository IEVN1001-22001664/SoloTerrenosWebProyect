import { Suspense } from "react";
import type { LatLngTuple } from "leaflet";
import Link from "next/link";
import TerrenoMapWrapper from "./TerrenoMapWrapper";
import TerrenoContactoActions from "./terrenoContactoActions";
import FavoriteButton from "@/components/terrenos/favoriteButton";
import TerrenoGaleria from "./terrenoGaleria";
import TerrenoQuickActions from "./terrenoQuickActions";
import {
  ArrowLeft,
  MapPin,
  Ruler,
  ScanLine,
  Mountain,
  Grid3X3,
  FileText,
  Scale,
  BadgeCheck,
  Landmark,
  Home,
  Map,
  CircleDollarSign,
  Image as ImageIcon,
  HandCoins
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Terreno {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion?: string;
  tipo?: string;
  creado_en?: string;
  poligono?: number[][];
  usuario_id?: number;
  estado?: string;
  search_vector?: string;
  centro_lat?: number;
  centro_lng?: number;
  area_m2?: number | string;
  perimetro_m?: number | string;
  estado_region?: string;
  municipio?: string;
  colonia?: string;
  direccion?: string;
  codigo_postal?: string;
  topografia?: string;
  forma?: string;
  tipo_propiedad?: string;
  uso_suelo?: string;
  negociable?: boolean;
  actualizado_en?: string;
  escritura?: string;
  estatus_legal?: string;
  gravamen?: string;
  imagen_principal?: string;
}

interface TerrenoImagen {
  id: number;
  url: string;
}

async function getTerreno(id: string): Promise<Terreno | null> {
  try {
    const res = await fetch(`${API_URL}/api/terrenos/id/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error("Error al obtener terreno:", error);
    return null;
  }
}

async function getTerrenoImagenes(id: string): Promise<TerrenoImagen[]> {
  try {
    const res = await fetch(`${API_URL}/api/terrenos/${id}/imagenes`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data?.imagenes) ? data.imagenes : [];
  } catch (error) {
    console.error("Error al obtener imágenes del terreno:", error);
    return [];
  }
}

function getImageUrl(url?: string) {
  if (!url) return "/images/terreno-placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

function money(value?: number | string) {
  return `$${Number(value || 0).toLocaleString("es-MX")} MXN`;
}

function text(value?: string, fallback = "No especificado") {
  return value && value.toString().trim() ? value : fallback;
}

function capitalizeWords(value?: string, fallback = "No especificado") {
  const clean = value && value.toString().trim();
  if (!clean) return fallback;

  return clean
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function boolText(value?: boolean) {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "No especificado";
}

function areaText(value?: number | string) {
  const area = Number(value);
  if (!Number.isNaN(area) && area > 0) {
    return `${Math.round(area)} m²`;
  }
  return "Por definir";
}

function perimeterText(value?: number | string) {
  const perimeter = Number(value);
  if (!Number.isNaN(perimeter) && perimeter > 0) {
    return `${Math.round(perimeter)} m`;
  }
  return "Por definir";
}

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f7f6f1] p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#817d58]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#22341c]">{value}</p>
    </div>
  );
}

function DataCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f7f6f1] p-5">
      {icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
          {icon}
        </div>
      ) : null}
      <p className="text-sm text-[#817d58]">{label}</p>
      <p className="mt-1 font-semibold text-[#22341c]">{value}</p>
    </div>
  );
}

export default async function TerrenoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [terreno, imagenes] = await Promise.all([
    getTerreno(id),
    getTerrenoImagenes(id),
  ]);

  if (!terreno) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 pb-16 pt-24 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-[#817d58]/20 bg-white p-10 shadow-sm">
            <h1 className="text-2xl font-bold text-[#22341c]">
              Terreno no encontrado
            </h1>
            <p className="mt-2 text-sm text-[#817d58]">
              Esta publicación no está disponible o fue retirada.
            </p>

            <Link
              href="/terrenos"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#22341c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
            >
              <ArrowLeft size={16} />
              Volver al listado
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const ubicacionGeneral =
    [terreno.colonia, terreno.municipio, terreno.estado_region]
      .filter(Boolean)
      .join(", ") ||
    terreno.ubicacion ||
    "Ubicación no definida";

  const direccionCompleta =
    [
      terreno.direccion,
      terreno.colonia,
      terreno.municipio,
      terreno.estado_region,
      terreno.codigo_postal,
    ]
      .filter(Boolean)
      .join(", ") || "No especificada";

    const googleMapsQuery =
    terreno.centro_lat && terreno.centro_lng
      ? `${terreno.centro_lat},${terreno.centro_lng}`
      : direccionCompleta !== "No especificada"
      ? direccionCompleta
      : ubicacionGeneral;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    googleMapsQuery
  )}`;

  const tipoVisible =
    terreno.uso_suelo || terreno.tipo_propiedad || terreno.tipo || "Terreno";

  const galeria =
    imagenes.length > 0
      ? imagenes.map((img) => ({
          id: img.id,
          url: getImageUrl(img.url),
        }))
      : terreno.imagen_principal
      ? [{ id: 0, url: getImageUrl(terreno.imagen_principal) }]
      : [{ id: 0, url: "/images/terreno-placeholder.jpg" }];

  const portada = galeria[0]?.url || "/images/terreno-placeholder.jpg";
  const secundarias =
    galeria.slice(1, 5).length > 0
      ? galeria.slice(1, 5)
      : [1, 2, 3, 4].map((item) => ({
          id: item,
          url: portada,
        }));

  const tieneMapa =
    Array.isArray(terreno.poligono) && terreno.poligono.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f6f1] pb-16 pt-24">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-6 xl:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/terrenos"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#817d58] transition hover:text-[#22341c]"
          >
            <ArrowLeft size={16} />
            Volver a terrenos
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#22341c] px-3 py-1 text-xs font-semibold text-white">
              {text(tipoVisible)}
            </span>

            {terreno.negociable === true && (
              <span className="rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold text-[#22341c]">
                Precio negociable
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h1 className="max-w-5xl text-3xl font-bold leading-tight tracking-tight text-[#22341c] md:text-4xl xl:text-[2.8rem]">
            {terreno.titulo}
          </h1>

          <p className="mt-3 flex items-center gap-2 text-sm text-[#817d58] md:text-base">
            <MapPin size={17} />
            {ubicacionGeneral}
          </p>
        </div>

        {/* GALERÍA SUPERIOR */}
       <TerrenoGaleria titulo={terreno.titulo} imagenes={galeria} />

        {/* RESUMEN IZQ + DESCRIPCIÓN DER */}
        <section className="mb-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <article className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#22341c] via-[#2d4424] to-[#828d4b] p-5 text-white shadow-sm md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/90 w-fit">
                Resumen
              </span>

              <TerrenoQuickActions
                terrenoId={terreno.id}
                titulo={terreno.titulo}
                ubicacion={ubicacionGeneral}
                googleMapsUrl={googleMapsUrl}
              />
            </div>

            <div>
              <p className="text-3xl font-bold tracking-tight">
                {money(terreno.precio)}
              </p>
              <p className="mt-1 text-sm font-medium text-white/75">
                {terreno.negociable ? "Precio negociable" : "Precio no negociable"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniCard label="Superficie" value={areaText(terreno.area_m2)} />
              <MiniCard
                label="Perímetro"
                value={perimeterText(terreno.perimetro_m)}
              />
              <MiniCard
                label="Uso de suelo"
                value={capitalizeWords(terreno.uso_suelo)}
              />
              <MiniCard
                label="Tipo"
                value={capitalizeWords(terreno.tipo_propiedad || terreno.tipo)}
              />
              <MiniCard
                label="Topografía"
                value={capitalizeWords(terreno.topografia)}
              />
              <MiniCard
                label="Forma"
                value={capitalizeWords(terreno.forma)}
              />
            </div>

            <div className="mt-5 border-t border-white/12 pt-5">
              <Suspense fallback={null}>
                <TerrenoContactoActions terrenoId={terreno.id} />
              </Suspense>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/12 pt-5 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <CircleDollarSign className="mt-0.5 text-[#d9e0bf]" size={18} />
                <p>
                  Solicita más información sobre precio, condiciones y proceso
                  de compra.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 text-[#d9e0bf]" size={18} />
                <p>
                  Revisa ubicación, superficie y situación legal antes de tomar
                  una decisión.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-7 xl:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15 text-[#22341c]">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#22341c] md:text-2xl">
                  Descripción del terreno
                </h2>
                <p className="text-sm text-[#817d58]">
                  Información general, contexto y ventajas del predio
                </p>
              </div>
            </div>

            <p className="whitespace-pre-line text-sm leading-8 text-[#4f4a3d] md:text-[15px] xl:text-base">
              {text(
                terreno.descripcion,
                "Este terreno no cuenta con una descripción detallada por el momento."
              )}
            </p>
          </article>
        </section>

        {/* MAPA ANCHO */}
        {tieneMapa && (
          <section className="mb-8 rounded-[2rem] border border-[#817d58]/15 bg-white p-5 shadow-sm md:p-6 xl:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15 text-[#22341c]">
                <Map size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#22341c] md:text-2xl">
                  Ubicación del terreno
                </h2>
                <p className="text-sm text-[#817d58]">
                  Referencia visual del polígono registrado
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-[#817d58]/12 bg-[#ece8dd]">
              <div className="h-[320px] md:h-[540px] xl:h-[680px]">
                <TerrenoMapWrapper
                  coordinates={terreno.poligono as LatLngTuple[]}
                />
              </div>
            </div>
          </section>
        )}

        {/* INFORMACIÓN INFERIOR */}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-5 shadow-sm md:p-6 xl:p-7">
              <h2 className="text-xl font-semibold text-[#22341c] md:text-2xl">
                Datos principales
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DataCard
                  icon={<Ruler size={18} />}
                  label="Superficie total"
                  value={areaText(terreno.area_m2)}
                />

                <DataCard
                  icon={<ScanLine size={18} />}
                  label="Perímetro"
                  value={perimeterText(terreno.perimetro_m)}
                />

                <DataCard
                  icon={<Mountain size={18} />}
                  label="Topografía"
                  value={capitalizeWords(terreno.topografia)}
                />

                <DataCard
                  icon={<Grid3X3 size={18} />}
                  label="Forma"
                  value={capitalizeWords(terreno.forma)}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-5 shadow-sm md:p-6 xl:p-7">
              <h2 className="text-xl font-semibold text-[#22341c] md:text-2xl">
                Ubicación
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DataCard
                  label="Ubicación general"
                  value={text(ubicacionGeneral)}
                />

                <DataCard
                  label="Dirección"
                  value={text(direccionCompleta)}
                />

                <DataCard
                  label="Municipio"
                  value={text(terreno.municipio)}
                />

                <DataCard
                  label="Estado / región"
                  value={text(terreno.estado_region)}
                />

                <DataCard
                  label="Colonia"
                  value={text(terreno.colonia)}
                />

                <DataCard
                  label="Código postal"
                  value={text(terreno.codigo_postal)}
                />
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-5 shadow-sm md:p-6 xl:p-7">
              <h2 className="text-xl font-semibold text-[#22341c] md:text-2xl">
                Información legal y comercial
              </h2>

              <div className="mt-5 grid gap-4">
                <DataCard
                  icon={<Home size={18} />}
                  label="Tipo de propiedad"
                  value={capitalizeWords(terreno.tipo_propiedad || terreno.tipo)}
                />

                <DataCard
                  icon={<Landmark size={18} />}
                  label="Uso de suelo"
                  value={capitalizeWords(terreno.uso_suelo)}
                />

                <DataCard
                  icon={<FileText size={18} />}
                  label="Escritura"
                  value={capitalizeWords(terreno.escritura)}
                />

                <DataCard
                  icon={<Scale size={18} />}
                  label="Estatus legal"
                  value={capitalizeWords(terreno.estatus_legal)}
                />

                <DataCard
                  icon={<HandCoins size={18} />}
                  label="Gravamen"
                  value={capitalizeWords(terreno.gravamen)}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#817d58]/15 bg-[#22341c] p-6 text-white shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-[#d5d8c2]">
                ¿Te interesa este terreno?
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Solicita más información
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#e7e9dd]">
                Ponte en contacto para conocer disponibilidad, negociación y
                proceso de compra.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Suspense fallback={null}>
                  <TerrenoContactoActions terrenoId={terreno.id} />
                </Suspense>
              </div>
            </section>
          </div>
        </div>

        {/* BLOQUE OPCIONAL DE TOTAL DE IMÁGENES */}
        <section className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#817d58] shadow-sm">
            <ImageIcon size={16} />
            {galeria.length} imagen{galeria.length === 1 ? "" : "es"} disponibles
          </div>
        </section>
      </div>
    </main>
  );
}