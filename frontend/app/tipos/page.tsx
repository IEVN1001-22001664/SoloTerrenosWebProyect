"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  LandPlot,
  Building2,
  Factory,
  Trees,
  Layers3,
  BadgeCheck,
  ShieldCheck,
  MapPinned,
} from "lucide-react";

type TipoTerreno = {
  id: string;
  nombre: string;
  slug: string;
  icon: React.ReactNode;
  imagen: string;
  resumen: string;
  descripcion: string;
  idealPara: string[];
  documentacion: string[];
  permisos: string[];
  recomendacion: string;
  color: string;
};

const tipos: TipoTerreno[] = [
  {
    id: "habitacional",
    nombre: "Habitacional",
    slug: "habitacional",
    icon: <LandPlot size={22} />,
    imagen: "/images/tipos/habitacional.png",
    resumen: "Terrenos pensados para vivienda unifamiliar, privada o fraccionamiento.",
    descripcion:
      "El suelo habitacional está orientado al desarrollo de casas, privadas, lotes residenciales y proyectos de vivienda. Suele ser el tipo más buscado por compradores finales e inversionistas que buscan plusvalía urbana.",
    idealPara: [
      "Casas habitación",
      "Privadas residenciales",
      "Fraccionamientos",
      "Inversión patrimonial",
    ],
    documentacion: [
      "Escritura o título de propiedad",
      "Boleta predial al corriente",
      "Constancia de uso de suelo",
      "Plano o croquis de ubicación",
    ],
    permisos: [
      "Licencia de construcción",
      "Alineamiento y número oficial",
      "Factibilidades de servicios",
    ],
    recomendacion:
      "Ideal si buscas vender a familias, inversionistas o desarrolladores de vivienda en zonas urbanas o de crecimiento.",
    color: "#828d4b",
  },
  {
    id: "comercial",
    nombre: "Comercial",
    slug: "comercial",
    icon: <Building2 size={22} />,
    imagen: "/images/tipos/comercial.png",
    resumen: "Terrenos destinados a negocios, locales, plazas, oficinas y servicios.",
    descripcion:
      "El suelo comercial tiene alto valor estratégico por su visibilidad, flujo vehicular y cercanía con zonas habitadas. Es clave para plazas, restaurantes, oficinas, tiendas o negocios de atención directa al público.",
    idealPara: [
      "Locales comerciales",
      "Plazas y strip malls",
      "Oficinas",
      "Negocios de servicios",
    ],
    documentacion: [
      "Escritura",
      "Predial vigente",
      "Uso de suelo comercial",
      "Plano del predio",
    ],
    permisos: [
      "Licencia de funcionamiento",
      "Licencia de construcción",
      "VoBo de protección civil según proyecto",
    ],
    recomendacion:
      "Conviene si el terreno tiene buena exposición, acceso y cercanía a avenidas, colonias densas o corredores comerciales.",
    color: "#817d58",
  },
  {
    id: "industrial",
    nombre: "Industrial",
    slug: "industrial",
    icon: <Factory size={22} />,
    imagen: "/images/tipos/industrial.png",
    resumen: "Pensado para bodegas, naves industriales, logística y manufactura.",
    descripcion:
      "El suelo industrial requiere condiciones más específicas: accesos de carga, cercanía a vías logísticas, factibilidad eléctrica y compatibilidad normativa. Su valor depende mucho de ubicación, infraestructura y vocación del corredor.",
    idealPara: [
      "Naves industriales",
      "Bodegas",
      "Centros logísticos",
      "Manufactura y almacenes",
    ],
    documentacion: [
      "Escritura",
      "Predial al corriente",
      "Uso de suelo industrial",
      "Factibilidad de energía y agua",
    ],
    permisos: [
      "Licencia de construcción especializada",
      "Estudios de impacto según proyecto",
      "Permisos municipales y ambientales",
    ],
    recomendacion:
      "Muy conveniente para compradores empresariales o inversionistas que buscan plusvalía en corredores logísticos o parques industriales.",
    color: "#22341c",
  },
  {
    id: "agricola",
    nombre: "Agrícola",
    slug: "agricola",
    icon: <Trees size={22} />,
    imagen: "/images/tipos/agricola.png",
    resumen: "Terrenos orientados al cultivo, producción primaria o aprovechamiento rural.",
    descripcion:
      "El suelo agrícola está vinculado a la producción del campo y suele evaluarse por calidad de tierra, agua disponible, accesos y régimen legal. Es atractivo tanto para producción como para inversión a largo plazo.",
    idealPara: [
      "Cultivo",
      "Producción agrícola",
      "Proyectos rurales",
      "Inversión de largo plazo",
    ],
    documentacion: [
      "Título o acreditación de propiedad",
      "Situación legal del régimen de tierra",
      "Plano o delimitación",
      "Documentos hídricos si aplica",
    ],
    permisos: [
      "Dependen del tipo de explotación",
      "Permisos ambientales si se transforma el uso",
      "Trámites agrarios en ciertos casos",
    ],
    recomendacion:
      "Adecuado para compradores del sector primario, proyectos rurales o inversionistas que entienden ciclos de valorización de suelo.",
    color: "#9f885c",
  },
  {
    id: "mixto",
    nombre: "Mixto",
    slug: "mixto",
    icon: <Layers3 size={22} />,
    imagen: "/images/tipos/mixto.png",
    resumen: "Permite combinar distintos aprovechamientos según normativa local.",
    descripcion:
      "El suelo mixto ofrece flexibilidad. Puede permitir vivienda, comercio e incluso ciertos servicios dentro de un mismo esquema, dependiendo del municipio y de la normatividad específica aplicable al predio.",
    idealPara: [
      "Desarrollos híbridos",
      "Locales con vivienda",
      "Proyectos escalables",
      "Inversión flexible",
    ],
    documentacion: [
      "Escritura",
      "Predial vigente",
      "Constancia de uso mixto o compatibilidad",
      "Planos del predio",
    ],
    permisos: [
      "Licencias según el proyecto final",
      "Compatibilidad urbana",
      "Revisión municipal de densidad y uso",
    ],
    recomendacion:
      "Muy útil si buscas versatilidad comercial y residencial, o si el valor del predio depende de diferentes salidas de comercialización.",
    color: "#426C8E",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
export default function TiposPage() {
  return (
    <main className="bg-[#f7f6f1] text-[#22341c]">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/hero-tipos.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#22341c]/90 via-[#22341c]/72 to-[#22341c]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7f6f1] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 pt-24 md:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              Guía pública de tipos de suelo
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Conoce los tipos de terrenos y elige el que mejor se adapta a tu proyecto.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
              Descubre qué significa cada tipo de suelo, para qué se utiliza, qué
              documentación suele requerirse y cuál puede ser la mejor opción según
              tu objetivo: vivienda, inversión, comercio, industria o producción rural.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/terrenos"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#828d4b] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Explorar terrenos
                <ArrowRight size={18} />
              </Link>

              <a
                href="#tipos-suelo"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Ver tipos de suelo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="tipos-suelo" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-8"
        >
          <motion.div variants={item} className="max-w-3xl">
            <h2 className="text-3xl font-bold md:text-4xl">
              Tipos de suelo y su vocación de uso
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5d654f]">
              Cada terreno tiene una vocación distinta. Elegir bien el tipo de suelo
              impacta directamente en la viabilidad del proyecto, la documentación
              necesaria, el tipo de comprador ideal y el potencial de comercialización.
            </p>
          </motion.div>

          {tipos.map((tipo, index) => (
            <motion.article
              key={tipo.id}
              variants={item}
              className="group overflow-hidden rounded-[30px] border border-[#e5dfd1] bg-white shadow-[0_16px_45px_rgba(34,52,28,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(34,52,28,0.12)]"
            >
              <div className="grid lg:grid-cols-[1.05fr_1fr]">
                <div className="relative min-h-[280px] overflow-hidden">
                  <Image
                    src={tipo.imagen}
                    alt={tipo.nombre}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#22341c]/70 via-[#22341c]/20 to-transparent" />

                  <div className="absolute left-6 top-6">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg"
                      style={{ backgroundColor: tipo.color }}
                    >
                      {tipo.icon}
                      {tipo.nombre}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="max-w-xl text-sm leading-6 text-white/90 md:text-base">
                      {tipo.resumen}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <h3 className="text-2xl font-bold md:text-3xl">{tipo.nombre}</h3>
                    <p className="mt-4 text-base leading-7 text-[#5d654f]">
                      {tipo.descripcion}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-[#f7f6f1] p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#22341c]">
                          <BadgeCheck size={17} />
                          Ideal para
                        </div>
                        <div className="space-y-2">
                          {tipo.idealPara.map((itemText) => (
                            <p key={itemText} className="text-sm text-[#5d654f]">
                              {itemText}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f7f6f1] p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#22341c]">
                          <FileText size={17} />
                          Documentación
                        </div>
                        <div className="space-y-2">
                          {tipo.documentacion.map((doc) => (
                            <p key={doc} className="text-sm text-[#5d654f]">
                              {doc}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f7f6f1] p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#22341c]">
                          <ShieldCheck size={17} />
                          Permisos
                        </div>
                        <div className="space-y-2">
                          {tipo.permisos.map((permiso) => (
                            <p key={permiso} className="text-sm text-[#5d654f]">
                              {permiso}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#ece5d6] bg-[#fcfbf8] p-5">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#22341c]">
                        <MapPinned size={17} />
                        Recomendación práctica
                      </div>
                      <p className="text-sm leading-6 text-[#5d654f]">
                        {tipo.recomendacion}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/terrenos?tipo=${encodeURIComponent(tipo.slug)}`}
                      className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                      style={{ backgroundColor: tipo.color }}
                    >
                      Ver terrenos {tipo.nombre.toLowerCase()}
                      <ArrowRight size={17} />
                    </Link>

                    <a
                      href="#comparativa"
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#d9d1c1] bg-white px-5 py-3 text-sm font-semibold text-[#22341c] transition hover:bg-[#f7f6f1]"
                    >
                      Comparar opciones
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section
        id="comparativa"
        className="border-y border-[#e7e0d2] bg-white py-16"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">
                ¿Cómo elegir el tipo de suelo correcto?
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5d654f]">
                La elección correcta depende del objetivo del comprador, el horizonte
                de inversión, la normativa local y la factibilidad real del predio.
                Un mismo terreno puede ser atractivo por ubicación, pero inviable por
                permisos o por incompatibilidad de uso.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  titulo: "Si buscas vivienda",
                  texto:
                    "Prioriza habitacional o mixto, especialmente en zonas con servicios, conectividad y crecimiento urbano.",
                },
                {
                  titulo: "Si buscas rentabilidad comercial",
                  texto:
                    "Busca suelo comercial con buena exposición, frente a avenidas o en zonas de alto flujo.",
                },
                {
                  titulo: "Si buscas operaciones logísticas",
                  texto:
                    "Industrial será la opción más sólida, siempre que el predio tenga accesibilidad y factibilidad.",
                },
                {
                  titulo: "Si buscas tierra productiva",
                  texto:
                    "Agrícola o rural según el caso. Aquí importa mucho el régimen legal, agua y vocación real del terreno.",
                },
              ].map((card) => (
                <div
                  key={card.titulo}
                  className="rounded-3xl bg-[#f7f6f1] p-6 transition hover:bg-[#f1eee7]"
                >
                  <h3 className="text-lg font-semibold">{card.titulo}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5d654f]">
                    {card.texto}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-[34px] border border-[#ddd5c5] bg-gradient-to-r from-[#22341c] via-[#22341c] to-[#3b4f30] p-8 text-white md:p-10"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Explora terrenos filtrados por tipo de suelo
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Si ya identificaste el tipo de terreno que te interesa, ve directo a la
            búsqueda pública y revisa las opciones disponibles filtradas por su
            vocación de uso.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {tipos.map((tipo) => (
              <Link
                key={tipo.id}
                href={`/terrenos?tipo=${encodeURIComponent(tipo.slug)}`}
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                style={{ backgroundColor: tipo.color }}
              >
                {tipo.nombre}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}