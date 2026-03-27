export type PolygonPoint =
  | [number, number]
  | { lat: number; lng: number };

export interface TerrenoMapa {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  ubicacion?: string;
  municipio?: string;
  estado_region?: string;
  tipo?: string;
  uso_suelo?: string;
  area_m2?: number | string;
  imagen_principal?: string | null;
  centro_lat: number;
  centro_lng: number;
  poligono?: PolygonPoint[] | unknown;
  estado?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FiltrosMapa {
  q: string;
  tipo: string;
  precioMin: string;
  precioMax: string;
}