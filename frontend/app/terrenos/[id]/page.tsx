import { LatLngTuple } from "leaflet";
import Link from "next/link";
import TerrenoMapWrapper from "./TerrenoMapWrapper";
import TerrenoContactoActions from "./terrenoContactoActions";
import {
  ArrowLeft,
  Bookmark,
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
  MoveRight,
} from "lucide-react";

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
    const res = await fetch(`http://localhost:5000/api/terrenos/${id}`, {
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
    const res = await fetch(`http://localhost:5000/api/terrenos/${id}/imagenes`, {
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
  return `http://localhost:5000${url}`;
}

function money(value?: number | string) {
  return `$${Number(value || 0).toLocaleString("es-MX")} MXN`;
}

function text(value?: string, fallback = "No especificado") {
  return value && value.toString().trim() ? value : fallback;
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
  const secundarias = galeria.slice(1, 5);

  const tieneMapa =
    Array.isArray(terreno.poligono) && terreno.poligono.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f6f1] pb-16 pt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6">
          <Link
            href="/terrenos"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#817d58] transition hover:text-[#22341c]"
          >
            <ArrowLeft size={16} />
            Volver a terrenos
          </Link>
        </div>

        {/* HERO PRINCIPAL */}
        <section className="mb-10 overflow-hidden rounded-[2.25rem] border border-[#817d58]/15 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_420px]">
            <div className="bg-gradient-to-br from-[#22341c] via-[#2d4424] to-[#828d4b] px-6 py-8 text-white md:px-10 md:py-10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {text(tipoVisible)}
                </span>

                {terreno.negociable === true && (
                  <span className="rounded-full bg-[#9f885c]/25 px-3 py-1 text-xs font-medium text-white">
                    Precio negociable
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                {terreno.titulo}
              </h1>

              <p className="mt-4 flex items-center gap-2 text-sm text-white/85 md:text-base">
                <MapPin size={17} />
                {ubicacionGeneral}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 md:max-w-2xl md:grid-cols-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                    Precio
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {money(terreno.precio)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                    Superficie
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {areaText(terreno.area_m2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                    Uso de suelo
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {text(terreno.uso_suelo)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                    Tipo
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {text(terreno.tipo_propiedad || terreno.tipo)}
                  </p>
                </div>
              </div>
            </div>

            <aside className="border-t border-[#817d58]/12 bg-white lg:border-l lg:border-t-0">
              <div className="border-b border-[#817d58]/12 px-6 py-6">
                <p className="text-sm uppercase tracking-[0.14em] text-[#817d58]">
                  Información rápida
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[#22341c]">
                  {money(terreno.precio)}
                </p>

                {terreno.negociable === true && (
                  <p className="mt-2 text-sm font-medium text-[#828d4b]">
                    El precio puede negociarse
                  </p>
                )}
              </div>

              <div className="space-y-3 px-6 py-6">
                <TerrenoContactoActions terrenoId={terreno.id} />
              </div>

              <div className="border-t border-[#817d58]/12 px-6 py-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CircleDollarSign className="mt-0.5 text-[#828d4b]" size={18} />
                    <p className="text-sm text-[#817d58]">
                      Solicita más información sobre precio, condiciones y proceso de compra.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 text-[#828d4b]" size={18} />
                    <p className="text-sm text-[#817d58]">
                      Revisa ubicación, superficie y situación legal antes de tomar una decisión.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* GALERÍA */}
        <section className="mb-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.65fr_1fr]">
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src={portada}
                alt={terreno.titulo}
                className="h-[340px] w-full object-cover md:h-[540px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
              {secundarias.length > 0 ? (
                secundarias.map((imagen) => (
                  <div
                    key={imagen.id}
                    className="overflow-hidden rounded-[1.5rem]"
                  >
                    <img
                      src={imagen.url}
                      alt="Imagen del terreno"
                      className="h-[162px] w-full object-cover md:h-[123px]"
                    />
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[1.5rem]"
                  >
                    <img
                      src={portada}
                      alt="Imagen del terreno"
                      className="h-[162px] w-full object-cover opacity-90 md:h-[123px]"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* MAPA */}
        {tieneMapa && (
          <section className="mb-10 rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9f885c]/15 text-[#22341c]">
                <Map size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#22341c]">
                  Ubicación del terreno
                </h2>
                <p className="text-sm text-[#817d58]">
                  Referencia visual del polígono registrado
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-[#817d58]/12">
              <div className="h-[340px] md:h-[460px]">
                <TerrenoMapWrapper
                  coordinates={terreno.poligono as LatLngTuple[]}
                />
              </div>
            </div>
          </section>
        )}

        {/* DESCRIPCIÓN */}
        <section className="mb-10 rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold text-[#22341c]">
            Descripción del terreno
          </h2>

          <p className="mt-5 whitespace-pre-line leading-8 text-[#4f4a3d]">
            {text(
              terreno.descripcion,
              "Este terreno no cuenta con una descripción detallada por el momento."
            )}
          </p>
        </section>

        {/* INFORMACIÓN COMPLEMENTARIA */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-10">
            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold text-[#22341c]">
                Datos principales
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Ruler size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Superficie total</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {areaText(terreno.area_m2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <ScanLine size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Perímetro</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {perimeterText(terreno.perimetro_m)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Mountain size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Topografía</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.topografia)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Grid3X3 size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Forma</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.forma)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold text-[#22341c]">
                Ubicación
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Ubicación general</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(ubicacionGeneral)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Dirección</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(direccionCompleta)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Municipio</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.municipio)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Estado / región</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.estado_region)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Colonia</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.colonia)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Código postal</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.codigo_postal)}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section className="rounded-[2rem] border border-[#817d58]/15 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold text-[#22341c]">
                Información legal y comercial
              </h2>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Home size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Tipo de propiedad</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.tipo_propiedad || terreno.tipo)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Landmark size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Uso de suelo</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.uso_suelo)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <FileText size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Escritura</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.escritura)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#9f885c]/15 text-[#22341c]">
                    <Scale size={18} />
                  </div>
                  <p className="text-sm text-[#817d58]">Estatus legal</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.estatus_legal)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Gravamen</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {text(terreno.gravamen)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f6f1] p-5">
                  <p className="text-sm text-[#817d58]">Negociable</p>
                  <p className="mt-1 font-semibold text-[#22341c]">
                    {boolText(terreno.negociable)}
                  </p>
                </div>
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
                Ponte en contacto para conocer disponibilidad, negociación y proceso de compra.
              </p>

              <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#828d4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f885c]">
                Contactar ahora
                <MoveRight size={16} />
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}