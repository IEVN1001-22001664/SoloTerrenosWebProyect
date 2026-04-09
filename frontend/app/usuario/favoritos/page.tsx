"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  MapPinned,
  Search,
  Trash2,
  SlidersHorizontal,
  ArrowUpDown,
  Map,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Favorito {
  id: number;
  terreno_id: number;
  titulo: string;
  ubicacion: string;
  precio: number | string;
  imagen_principal?: string | null;
  fecha_guardado?: string;
  tipo?: string;
}

interface TerrenoImagen {
  id?: number;
  url?: string;
  ruta?: string;
}

async function getTerrenoImagenes(id: string): Promise<TerrenoImagen[]> {
  try {
    const res = await fetch(`${API_URL}/api/terrenos/${id}/imagenes`, {
      credentials: "include",
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

function getImagenFavorito(img?: string | null) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img}`;
}

export default function UsuarioFavoritosPage() {
  const { user, loading } = useAuth();

  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    fetchFavoritos();
  }, [loading, user]);

  const fetchFavoritos = async () => {
    try {
      setCargando(true);

      const response = await fetch(`${API_URL}/api/favoritos/mis-favoritos`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudieron cargar tus favoritos.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        setFavoritos([]);
        return;
      }

      const favoritosBase: Favorito[] = Array.isArray(data) ? data : [];

      const favoritosConImagen = await Promise.all(
        favoritosBase.map(async (favorito) => {
          const imagenes = await getTerrenoImagenes(String(favorito.terreno_id));

          return {
            ...favorito,
            imagen_principal:
              imagenes.length > 0
                ? imagenes[0].url || imagenes[0].ruta || null
                : null,
          };
        })
      );

      setFavoritos(favoritosConImagen);
    } catch (error) {
      console.error("Error cargando favoritos:", error);
      toast.error("Ocurrió un error al cargar tus favoritos.");
      setFavoritos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleRemoveFavorito = async (favorito: Favorito) => {
    try {
      setEliminandoId(favorito.id);

      const response = await fetch(
        `${API_URL}/api/favoritos/${favorito.terreno_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo quitar de favoritos.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      setFavoritos((prev) => prev.filter((item) => item.id !== favorito.id));

      toast.success("Terreno eliminado de favoritos.");
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      toast.error("Ocurrió un error al quitar el favorito.");
    } finally {
      setEliminandoId(null);
    }
  };

  const favoritosFiltrados = useMemo(() => {
    let items = [...favoritos];

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      items = items.filter(
        (item) =>
          item.titulo?.toLowerCase().includes(texto) ||
          item.ubicacion?.toLowerCase().includes(texto) ||
          item.tipo?.toLowerCase().includes(texto)
      );
    }

    if (orden === "precio-asc") {
      items.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (orden === "precio-desc") {
      items.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else if (orden === "titulo") {
      items.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else {
      items.sort((a, b) => {
        const fechaA = a.fecha_guardado ? new Date(a.fecha_guardado).getTime() : 0;
        const fechaB = b.fecha_guardado ? new Date(b.fecha_guardado).getTime() : 0;
        return fechaB - fechaA;
      });
    }

    return items;
  }, [favoritos, busqueda, orden]);

  if (loading || cargando) {
    return (
      <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando favoritos...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#9f885c]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#22341c]">
              <Heart size={14} />
              Favoritos
            </div>

            <h1 className="text-3xl font-bold text-[#22341c] md:text-4xl">
              Mis terrenos guardados
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#817d58] md:text-base">
              Revisa y administra los terrenos que has guardado para comparar,
              contactar o consultar después.
            </p>
          </div>

          <Link
            href="/terrenos"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
          >
            <Search size={16} />
            Seguir explorando
          </Link>
        </section>

        <section className="mb-6 grid gap-4 rounded-[2rem] border border-[#817d58]/12 bg-white p-5 shadow-sm md:grid-cols-[1.3fr_0.35fr]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817d58]"
            />
            <input
              type="text"
              placeholder="Buscar por título, ubicación o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] py-3 pl-11 pr-4 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817d58]"
            />
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-[#817d58]/18 bg-[#f7f6f1] py-3 pl-11 pr-4 text-sm text-[#22341c] outline-none transition focus:ring-2 focus:ring-[#9f885c]/35"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="titulo">Orden alfabético</option>
            </select>
          </div>
        </section>

        <section className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#817d58] shadow-sm">
            <ArrowUpDown size={14} />
            {favoritosFiltrados.length} terreno
            {favoritosFiltrados.length === 1 ? "" : "s"} encontrado
            {favoritosFiltrados.length === 1 ? "" : "s"}
          </div>
        </section>

        {favoritosFiltrados.length === 0 ? (
          <section className="rounded-[2rem] border border-[#817d58]/12 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#9f885c]/15 text-[#22341c]">
              <Heart size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#22341c]">
              Aún no tienes favoritos guardados
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#817d58] md:text-base">
              Guarda terrenos que te interesen para revisarlos con calma, comparar
              opciones y retomarlos más adelante desde tu cuenta.
            </p>

            <Link
              href="/terrenos"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22341c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#828d4b]"
            >
              <Search size={16} />
              Explorar terrenos
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoritosFiltrados.map((favorito) => {
                const imagenUrl = getImagenFavorito(favorito.imagen_principal);

                return (
                <article
                    key={favorito.id}
                    className="group overflow-hidden rounded-[1.7rem] border border-[#817d58]/12 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Link
                    href={`/terrenos/${favorito.terreno_id}`}
                    className="block"
                    >
                    <div className="relative">
                        <div className="h-52 w-full overflow-hidden bg-[#e8e3d6]">
                        {imagenUrl ? (
                            <img
                            src={imagenUrl}
                            alt={favorito.titulo}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-[#817d58]">
                            Sin imagen disponible
                            </div>
                        )}
                        </div>

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

                        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#22341c] shadow-sm backdrop-blur-sm transition hover:scale-105"
                            title="Ver en mapa"
                        >
                            <Map size={16} />
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFavorito(favorito);
                            }}
                            disabled={eliminandoId === favorito.id}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition hover:scale-105 disabled:opacity-60"
                            title="Quitar de favoritos"
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>

                        {favorito.tipo && (
                        <div className="absolute bottom-3 left-3">
                            <span className="rounded-full bg-[#22341c]/90 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            {favorito.tipo}
                            </span>
                        </div>
                        )}
                    </div>

                    <div className="p-4">
                        <h2 className="line-clamp-2 text-[1rem] font-semibold text-[#22341c] transition group-hover:text-[#828d4b]">
                        {favorito.titulo}
                        </h2>

                        <div className="mt-2 flex items-center gap-2 text-sm text-[#817d58]">
                        <MapPinned size={14} />
                        <span className="line-clamp-1">{favorito.ubicacion}</span>
                        </div>

                        <p className="mt-3 text-xl font-bold tracking-tight text-[#22341c]">
                        ${Number(favorito.precio).toLocaleString("es-MX")}
                        </p>
                    </div>
                    </Link>
                </article>
                );
            })}
            </section>
        )}
      </div>
    </main>
  );
}