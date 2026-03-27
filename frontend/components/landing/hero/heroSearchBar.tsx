"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Layers3, Ruler, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

interface SearchSuggestion {
  id: number;
  titulo: string;
  ubicacion?: string;
  tipo?: string;
  area_m2?: number;
  precio?: number;
  score?: number;
}

export default function HeroSearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = () => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      router.push("/terrenos");
      return;
    }

    router.push(`/terrenos?search=${encodeURIComponent(cleanQuery)}`);
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    router.push(`/terrenos/${item.id}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      const cleanQuery = query.trim();

      if (cleanQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/terrenos/search-suggestions?q=${encodeURIComponent(cleanQuery)}`
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar sugerencias");
        }

        const data = await response.json();
        setSuggestions(data?.results || []);
      } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-4xl">
      <div
        className="
          flex w-full items-center overflow-hidden rounded-full border border-white/50 bg-white/95
          backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.18)]
          transition-all duration-300
          focus-within:scale-[1.01]
          focus-within:shadow-[0_18px_50px_rgba(0,0,0,0.22)]
        "
      >
        <div className="pl-5 pr-3 text-gray-400">
          <Search size={22} />
        </div>

        <input
          type="text"
          placeholder="Busca por ubicación, tipo de terreno, superficie o palabra clave..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="
            flex-1 bg-transparent py-5 pr-4 text-[15px] text-gray-800 outline-none
            placeholder:text-gray-400 md:text-base
          "
        />

        <button
          onClick={handleSearch}
          className="
            m-2 inline-flex items-center gap-2 rounded-full bg-[#22341c] px-6 py-3.5
            font-medium text-white shadow-md transition-all duration-300
            hover:bg-[#1a2916] hover:shadow-lg
          "
        >
          <Search size={18} />
          Buscar
        </button>
      </div>

      {showSuggestions && query.trim().length >= 2 && (
        <div
          className="
            absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-3xl border border-gray-100
            bg-white shadow-2xl
          "
        >
          <div className="border-b border-gray-100 px-5 py-3 text-sm text-gray-500">
            Sugerencias inteligentes
          </div>

          {loading ? (
            <div className="flex items-center gap-3 px-5 py-5 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Buscando resultados relevantes...
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[360px] overflow-y-auto">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelectSuggestion(item)}
                    className="
                      w-full border-b border-gray-100 px-5 py-4 text-left transition
                      last:border-b-0 hover:bg-gray-50
                    "
                  >
                    <div className="line-clamp-1 font-semibold text-gray-800">
                      {item.titulo}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      {item.ubicacion && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {item.ubicacion}
                        </span>
                      )}

                      {item.tipo && (
                        <span className="inline-flex items-center gap-1">
                          <Layers3 size={14} />
                          {item.tipo}
                        </span>
                      )}

                      {item.area_m2 && (
                        <span className="inline-flex items-center gap-1">
                          <Ruler size={14} />
                          {Math.round(item.area_m2).toLocaleString("es-MX")} m²
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}

              <li className="bg-gray-50 p-3">
                <button
                  onClick={handleSearch}
                  className="
                    w-full rounded-2xl bg-[#f5f7f4] px-4 py-3 text-sm font-medium
                    text-[#22341c] transition hover:bg-[#ebefe8]
                  "
                >
                  Ver todos los resultados para “{query.trim()}”
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-5 py-5 text-sm text-gray-500">
              No encontramos sugerencias. Presiona buscar para ver resultados completos.
            </div>
          )}
        </div>
      )}
    </div>
  );
}