"use client";

import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BadgeDollarSign,
  X,
  Check,
} from "lucide-react";
import { FiltrosMapa } from "./types";

interface Props {
  filtros: FiltrosMapa;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosMapa>>;
  total: number;
  onBuscarZona: () => void;
  loading: boolean;
  hasPendingChanges?: boolean;
  onLimpiarFiltros?: () => void;
}

const FILTROS_INICIALES: FiltrosMapa = {
  q: "",
  tipo: "",
  precioMin: "",
  precioMax: "",
};

const PRICE_PRESETS = [
  { label: "Cualquiera", min: "", max: "" },
  { label: "Hasta $500,000", min: "", max: "500000" },
  { label: "$500,000 - $1,000,000", min: "500000", max: "1000000" },
  { label: "$1,000,000 - $3,000,000", min: "1000000", max: "3000000" },
  { label: "$3,000,000 - $5,000,000", min: "3000000", max: "5000000" },
  { label: "$5,000,000 - $10,000,000", min: "5000000", max: "10000000" },
  { label: "Más de $10,000,000", min: "10000000", max: "" },
];

function formatMoneyCompact(value: string) {
  if (!value) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ZonasFiltersBar({
  filtros,
  setFiltros,
  total,
  onBuscarZona,
  loading,
  hasPendingChanges = false,
  onLimpiarFiltros,
}: Props) {
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);
  const [showPrecioPanel, setShowPrecioPanel] = useState(false);

  const hayFiltrosActivos = useMemo(() => {
    return (
      filtros.q.trim() !== "" ||
      filtros.tipo.trim() !== "" ||
      filtros.precioMin.trim() !== "" ||
      filtros.precioMax.trim() !== ""
    );
  }, [filtros]);

  const precioLabel = useMemo(() => {
    if (!filtros.precioMin && !filtros.precioMax) return "Precio";
    if (filtros.precioMin && filtros.precioMax) {
      return `${formatMoneyCompact(filtros.precioMin)} - ${formatMoneyCompact(
        filtros.precioMax
      )}`;
    }
    if (filtros.precioMin) return `Desde ${formatMoneyCompact(filtros.precioMin)}`;
    return `Hasta ${formatMoneyCompact(filtros.precioMax)}`;
  }, [filtros.precioMin, filtros.precioMax]);

  const selectedPreset = useMemo(() => {
    return PRICE_PRESETS.find(
      (preset) =>
        preset.min === filtros.precioMin && preset.max === filtros.precioMax
    );
  }, [filtros.precioMin, filtros.precioMax]);

  const handleLimpiar = () => {
    setShowPrecioPanel(false);

    if (onLimpiarFiltros) {
      onLimpiarFiltros();
      return;
    }

    setFiltros(FILTROS_INICIALES);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter") {
      onBuscarZona();
    }
  };

  const applyPricePreset = (min: string, max: string) => {
    setFiltros((prev) => ({
      ...prev,
      precioMin: min,
      precioMax: max,
    }));
  };

  return (
    <div className="sticky top-0 z-[1000] border-b border-[#d9d4c7] bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-[#22341c] sm:text-xl">
              Explora terrenos por mapa
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <p className="text-[#817d58]">
                {loading
                  ? "Buscando terrenos..."
                  : `${total} terreno${total === 1 ? "" : "s"} visible${total === 1 ? "" : "s"} en el mapa`}
              </p>

              {hasPendingChanges && !loading && (
                <span className="rounded-full bg-[#f1eee7] px-2.5 py-1 text-xs font-medium text-[#22341c]">
                  Hay cambios sin aplicar
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMostrarFiltrosMobile((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm font-medium text-[#22341c] transition hover:bg-[#f5f3ee] lg:hidden"
            >
              {mostrarFiltrosMobile ? <X size={16} /> : <SlidersHorizontal size={16} />}
              {mostrarFiltrosMobile ? "Cerrar filtros" : "Filtros"}
            </button>

            <button
              type="button"
              onClick={onBuscarZona}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22341c] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <MapPin size={16} />
              {loading ? "Buscando..." : "Buscar en esta zona"}
            </button>
          </div>
        </div>

        <div className={`${mostrarFiltrosMobile ? "block" : "hidden"} lg:block`}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_auto_auto]">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817d58]"
              />
              <input
                type="text"
                placeholder="Buscar por título o ubicación"
                value={filtros.q}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, q: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-[#d9d4c7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#22341c] outline-none transition focus:border-[#828d4b]"
              />
            </div>

            <select
              value={filtros.tipo}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, tipo: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              className="rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm text-[#22341c] outline-none transition focus:border-[#828d4b]"
            >
              <option value="">Todos los tipos</option>
              <option value="habitacional">Habitacional</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricola">Agrícola</option>
              <option value="campestre">Campestre</option>
            </select>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPrecioPanel((prev) => !prev)}
                className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm text-[#22341c] transition hover:bg-[#f5f3ee]"
              >
                <span className="inline-flex min-w-0 items-center gap-2 truncate">
                  <BadgeDollarSign size={16} />
                  <span className="truncate">{precioLabel}</span>
                </span>
                {showPrecioPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showPrecioPanel && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#ddd6c7] bg-white p-4 shadow-xl">
                  <h3 className="mb-3 text-sm font-semibold text-[#22341c]">
                    Rango de precio
                  </h3>

                  <div className="mb-4 space-y-2">
                    {PRICE_PRESETS.map((preset) => {
                      const active =
                        filtros.precioMin === preset.min &&
                        filtros.precioMax === preset.max;

                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPricePreset(preset.min, preset.max)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                            active
                              ? "border-[#828d4b] bg-[#f1eee7] text-[#22341c]"
                              : "border-[#e2dccf] bg-white text-[#22341c] hover:bg-[#f8f6f1]"
                          }`}
                        >
                          <span>{preset.label}</span>
                          {active && <Check size={16} className="text-[#22341c]" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#ece6da] pt-4">
                    <p className="mb-3 text-sm font-medium text-[#22341c]">
                      Rango personalizado
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Precio mín"
                        value={filtros.precioMin}
                        onChange={(e) =>
                          setFiltros((prev) => ({
                            ...prev,
                            precioMin: e.target.value,
                          }))
                        }
                        onKeyDown={handleKeyDown}
                        className="rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm text-[#22341c] outline-none focus:border-[#828d4b]"
                      />

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Precio máx"
                        value={filtros.precioMax}
                        onChange={(e) =>
                          setFiltros((prev) => ({
                            ...prev,
                            precioMax: e.target.value,
                          }))
                        }
                        onKeyDown={handleKeyDown}
                        className="rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm text-[#22341c] outline-none focus:border-[#828d4b]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFiltros((prev) => ({
                          ...prev,
                          precioMin: "",
                          precioMax: "",
                        }))
                      }
                      className="rounded-xl border border-[#d9d4c7] px-4 py-2 text-sm text-[#22341c] hover:bg-[#f5f3ee]"
                    >
                      Limpiar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPrecioPanel(false);
                        onBuscarZona();
                      }}
                      className="rounded-xl bg-[#22341c] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLimpiar}
              disabled={!hayFiltrosActivos && !loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9d4c7] bg-white px-4 py-2.5 text-sm font-medium text-[#22341c] transition hover:bg-[#f5f3ee] disabled:cursor-not-allowed disabled:opacity-50"
              title="Limpiar filtros"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          </div>

          {hayFiltrosActivos && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filtros.q.trim() && (
                <span className="rounded-full bg-[#f1eee7] px-3 py-1 text-xs text-[#22341c]">
                  Búsqueda: {filtros.q}
                </span>
              )}

              {filtros.tipo.trim() && (
                <span className="rounded-full bg-[#f1eee7] px-3 py-1 text-xs text-[#22341c]">
                  Tipo: {filtros.tipo}
                </span>
              )}

              {(filtros.precioMin.trim() || filtros.precioMax.trim()) && (
                <span className="rounded-full bg-[#f1eee7] px-3 py-1 text-xs text-[#22341c]">
                  Precio: {filtros.precioMin || "0"} - {filtros.precioMax || "sin tope"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}