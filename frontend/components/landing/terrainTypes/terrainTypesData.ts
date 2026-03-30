import {
  Factory,
  Store,
  Home,
  Trees,
  Layers3,
  Building2,
} from "lucide-react";

export const terrainTypes = [
  {
    title: "Industriales",
    description: "Naves, bodegas y logística",
    count: "450+ terrenos",
    icon: Factory,
    slug: "industrial",
  },
  {
    title: "Comerciales",
    description: "Plazas, locales y servicios",
    count: "380+ terrenos",
    icon: Store,
    slug: "comercial",
  },
  {
    title: "Habitacionales",
    description: "Residenciales y fraccionamientos",
    count: "540+ terrenos",
    icon: Home,
    slug: "habitacional",
  },
  {
    title: "Agrícolas",
    description: "Cultivo, producción y uso rural",
    count: "290+ terrenos",
    icon: Trees,
    slug: "agricola",
  },
  {
    title: "Mixtos",
    description: "Usos combinados y flexibles",
    count: "180+ terrenos",
    icon: Layers3,
    slug: "mixto",
  },
  {
    title: "Desarrollo",
    description: "Potencial urbano y escalable",
    count: "620+ terrenos",
    icon: Building2,
    slug: "mixto",
  },
];