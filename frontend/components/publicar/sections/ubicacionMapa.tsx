/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MapaComponent = dynamic(
  () => import("../../maps/mapaConfig"),
  { ssr: false }
);

interface Props {
  formData: any;
  setFormData: any;
}

const estadosMexico = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas"
];

export default function UbicacionMapa({ formData, setFormData }: Props) {
  const mapCenter = formData.mapCenter;
  const mapaVisible = formData.mapaVisible;

  const [busquedaEstado, setBusquedaEstado] = useState("");
  const [mostrarEstados, setMostrarEstados] = useState(false);

  const [sugerenciasDireccion, setSugerenciasDireccion] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [busquedaDireccionActiva, setBusquedaDireccionActiva] = useState(false);

  const [cargandoMapa, setCargandoMapa] = useState(false);

  const contenedorDireccionRef = useRef<HTMLDivElement | null>(null);

  const estadoSeleccionado = Boolean(formData.estado_region?.trim());

  const ubicacionCompleta = Boolean(
    formData.estado_region?.trim() &&
      formData.municipio?.trim() &&
      formData.colonia?.trim() &&
      formData.direccion?.trim() &&
      formData.codigo_postal?.trim()
  );

  const estadosFiltrados = useMemo(() => {
    const texto = busquedaEstado.toLowerCase().trim();

    if (!texto) return estadosMexico;

    return estadosMexico.filter((estado) =>
      estado.toLowerCase().includes(texto)
    );
  }, [busquedaEstado]);

  /* ===================================== */
  /* CERRAR SUGERENCIAS AL HACER CLICK FUERA */
  /* ===================================== */
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (
        contenedorDireccionRef.current &&
        !contenedorDireccionRef.current.contains(event.target as Node)
      ) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  /* ===================================== */
  /* SELECCIONAR ESTADO                    */
  /* ===================================== */
  const seleccionarEstado = (estado: string) => {
    setFormData({
      ...formData,
      estado_region: estado,
      municipio: "",
      colonia: "",
      direccion: "",
      codigo_postal: "",
      poligono: null,
      mapaVisible: false,
      mapCenter: null
    });

    setBusquedaEstado("");
    setMostrarEstados(false);
    setSugerenciasDireccion([]);
    setMostrarSugerencias(false);
    setBusquedaDireccionActiva(false);
  };

  /* ===================================== */
  /* INVALIDAR MAPA SI CAMBIA UBICACIÓN    */
  /* ===================================== */
  const invalidarMapa = (nuevosDatos: any) => {
    setFormData({
      ...nuevosDatos,
      poligono: null,
      mapaVisible: false,
      mapCenter: null
    });
  };

  /* ===================================== */
  /* AUTOCOMPLETADO SOLO PARA DIRECCIÓN    */
  /* ===================================== */
  useEffect(() => {
    const direccion = formData.direccion?.trim();
    const estado = formData.estado_region?.trim();

    if (
      !estadoSeleccionado ||
      !direccion ||
      direccion.length < 3 ||
      !busquedaDireccionActiva
    ) {
      setSugerenciasDireccion([]);
      setMostrarSugerencias(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCargandoSugerencias(true);

        const consulta = [direccion, estado, "México"]
          .filter(Boolean)
          .join(", ");

        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=mx&q=${encodeURIComponent(
          consulta
        )}`;

        const response = await fetch(url, {
          headers: {
            "Accept-Language": "es"
          }
        });

        const data = await response.json();

        setSugerenciasDireccion(data || []);
        setMostrarSugerencias(true);
      } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
        setSugerenciasDireccion([]);
        setMostrarSugerencias(true);
      } finally {
        setCargandoSugerencias(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.direccion,
    formData.estado_region,
    estadoSeleccionado,
    busquedaDireccionActiva
  ]);

  /* ===================================== */
  /* SELECCIONAR SUGERENCIA                */
  /* ===================================== */
  const seleccionarSugerencia = (item: any) => {
    const address = item.address || {};

    const direccionConstruida = [address.road, address.house_number]
      .filter(Boolean)
      .join(" ");

    invalidarMapa({
      ...formData,
      direccion: direccionConstruida || item.display_name || formData.direccion
    });

    setSugerenciasDireccion([]);
    setMostrarSugerencias(false);
    setBusquedaDireccionActiva(false);
  };

  /* ===================================== */
  /* ABRIR MAPA MANUALMENTE                */
  /* ===================================== */
  const abrirMapa = async () => {
    if (!ubicacionCompleta) return;

    try {
      setCargandoMapa(true);

      const consulta = [
        formData.direccion,
        formData.colonia,
        formData.municipio,
        formData.estado_region,
        formData.codigo_postal,
        "México"
      ]
        .filter(Boolean)
        .join(", ");

      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(
        consulta
      )}`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "es"
        }
      });

      const data = await response.json();

      if (data && data.length > 0) {
        setFormData({
          ...formData,
          mapCenter: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
          mapaVisible: true
        });
      } else {
        alert("No se pudo ubicar la dirección en el mapa.");
      }
    } catch (error) {
      console.error("Error abriendo mapa:", error);
      alert("Ocurrió un error al intentar ubicar la dirección.");
    } finally {
      setCargandoMapa(false);
    }
  };

  const clasesInputBase =
    "w-full rounded-xl border p-3 outline-none transition";
  const clasesInputActiva =
    "border-[#817d58]/40 focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20";
  const clasesInputBloqueada =
    "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#22341c]">
          Ubicación del terreno
        </h2>

        <p className="text-sm text-[#817d58] mt-1">
          Completa la ubicación y después habilita el mapa manualmente.
        </p>
      </div>

      <div className="rounded-2xl border border-[#817d58]/20 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ESTADO */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Estado <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setMostrarEstados((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-[#817d58]/40 bg-white px-4 py-3 text-left text-[#22341c] shadow-sm transition hover:border-[#828d4b]"
            >
              <span
                className={
                  formData.estado_region ? "text-[#22341c]" : "text-gray-400"
                }
              >
                {formData.estado_region || "Debes seleccionar una opción"}
              </span>

              <span className="text-[#22341c] text-lg">
                {mostrarEstados ? "⌃" : "⌄"}
              </span>
            </button>

            {mostrarEstados && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[#817d58]/20 bg-white p-4 shadow-xl">
                <input
                  type="text"
                  placeholder="Buscar estado..."
                  value={busquedaEstado}
                  onChange={(e) => setBusquedaEstado(e.target.value)}
                  className="mb-3 w-full rounded-xl border border-[#817d58]/40 p-3 outline-none focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
                />

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {estadosFiltrados.length > 0 ? (
                    estadosFiltrados.map((estado) => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => seleccionarEstado(estado)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-[#22341c] transition hover:bg-[#828d4b]/10"
                      >
                        {estado}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No se encontraron estados.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MUNICIPIO */}
          <div>
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Municipio o alcaldía <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Escribe el municipio"
              value={formData.municipio}
              disabled={!estadoSeleccionado}
              onChange={(e) =>
                invalidarMapa({
                  ...formData,
                  municipio: e.target.value
                })
              }
              className={`${clasesInputBase} ${
                estadoSeleccionado ? clasesInputActiva : clasesInputBloqueada
              }`}
            />
          </div>

          {/* COLONIA */}
          <div>
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Colonia o barrio <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Escribe la colonia"
              value={formData.colonia}
              disabled={!estadoSeleccionado}
              onChange={(e) =>
                invalidarMapa({
                  ...formData,
                  colonia: e.target.value
                })
              }
              className={`${clasesInputBase} ${
                estadoSeleccionado ? clasesInputActiva : clasesInputBloqueada
              }`}
            />
          </div>

          {/* DIRECCIÓN */}
          <div
            ref={contenedorDireccionRef}
            className="md:col-span-2 relative"
          >
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Dirección aproximada <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Escribe calle, referencia o dirección"
              value={formData.direccion}
              disabled={!estadoSeleccionado}
              onFocus={() => {
                if (sugerenciasDireccion.length > 0 && busquedaDireccionActiva) {
                  setMostrarSugerencias(true);
                }
              }}
              onChange={(e) => {
                invalidarMapa({
                  ...formData,
                  direccion: e.target.value
                });
                setBusquedaDireccionActiva(true);
              }}
              className={`${clasesInputBase} ${
                estadoSeleccionado ? clasesInputActiva : clasesInputBloqueada
              }`}
            />

            {estadoSeleccionado && mostrarSugerencias && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[#817d58]/20 bg-white shadow-xl overflow-hidden">
                {cargandoSugerencias ? (
                  <div className="px-4 py-3 text-sm text-[#817d58]">
                    Buscando sugerencias...
                  </div>
                ) : sugerenciasDireccion.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto">
                    {sugerenciasDireccion.map((item, index) => (
                      <button
                        key={`${item.place_id}-${index}`}
                        type="button"
                        onClick={() => seleccionarSugerencia(item)}
                        className="block w-full border-b border-[#817d58]/10 px-4 py-3 text-left text-sm text-[#22341c] transition hover:bg-[#828d4b]/10"
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                ) : (
                  busquedaDireccionActiva &&
                  formData.direccion?.trim().length >= 3 && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No se encontraron sugerencias.
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* CÓDIGO POSTAL + BOTÓN */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Código postal <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Ej. 37260"
                value={formData.codigo_postal}
                disabled={!estadoSeleccionado}
                onChange={(e) =>
                  invalidarMapa({
                    ...formData,
                    codigo_postal: e.target.value
                  })
                }
                className={`flex-1 ${clasesInputBase} ${
                  estadoSeleccionado ? clasesInputActiva : clasesInputBloqueada
                }`}
              />

              <button
                type="button"
                onClick={abrirMapa}
                disabled={!ubicacionCompleta || cargandoMapa}
                className={`px-5 py-3 rounded-xl font-medium transition ${
                  ubicacionCompleta && !cargandoMapa
                    ? "bg-[#22341c] text-white hover:bg-[#828d4b]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {cargandoMapa ? "Ubicando..." : "Ver mapa"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE DEL MAPA */}
      <div className="space-y-6">
        {!mapaVisible && (
          <div className="rounded-2xl border border-dashed border-[#817d58]/30 bg-[#828d4b]/5 p-6 text-center">
            <p className="text-[#22341c] font-medium">
              Completa la ubicación y presiona{" "}
              <span className="font-semibold">“Ver mapa”</span> para dibujar el
              terreno.
            </p>
          </div>
        )}

        {mapaVisible && mapCenter && (
          <MapaComponent
            mapCenter={mapCenter}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}