/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const MapaComponent = dynamic(
  () => import("../../maps/mapaConfig"),
  { ssr: false }
);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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

  const [busquedaEstado, setBusquedaEstado] = useState("");
  const [mostrarEstados, setMostrarEstados] = useState(false);
  const [cargandoMapa, setCargandoMapa] = useState(false);

  const [coloniasDisponibles, setColoniasDisponibles] = useState<string[]>([]);
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState<string[]>([]);

  const [cargandoSepomex, setCargandoSepomex] = useState(false);
  const [errorSepomex, setErrorSepomex] = useState("");

  const estadosFiltrados = useMemo(() => {
    const texto = busquedaEstado.toLowerCase().trim();

    if (!texto) return estadosMexico;

    return estadosMexico.filter((estado) =>
      estado.toLowerCase().includes(texto)
    );
  }, [busquedaEstado]);

  /* ===================================== */
  /* CARGAR DATOS DE SEPOMEX POR CP        */
  /* ===================================== */
  useEffect(() => {
    const codigoPostal = formData.codigo_postal?.trim();

    if (!codigoPostal || codigoPostal.length !== 5) {
      setErrorSepomex("");
      setMunicipiosDisponibles([]);
      setColoniasDisponibles([]);

      if (!codigoPostal || codigoPostal.length < 5) {
        setFormData((prev: any) => ({
          ...prev,
          estado_region: "",
          municipio: "",
          colonia: ""
        }));
      }

      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCargandoSepomex(true);
        setErrorSepomex("");

        const response = await fetch(
          `${API_URL}/api/sepomex/${codigoPostal}`,
          {
            method: "GET",
            credentials: "include"
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMunicipiosDisponibles([]);
          setColoniasDisponibles([]);

          setFormData((prev: any) => ({
            ...prev,
            estado_region: "",
            municipio: "",
            colonia: ""
          }));

          setErrorSepomex(data.message || "No se encontró el código postal.");
          return;
        }

        const municipio = data.municipio || "";
        const estado = data.estado || "";
        const colonias = Array.isArray(data.colonias) ? data.colonias : [];

        setMunicipiosDisponibles(municipio ? [municipio] : []);
        setColoniasDisponibles(colonias);

        setFormData((prev: any) => ({
          ...prev,
          estado_region: estado,
          municipio: municipio,
          colonia: colonias.includes(prev.colonia) ? prev.colonia : ""
        }));
      } catch (error) {
        console.error("Error consultando SEPOMEX:", error);

        setMunicipiosDisponibles([]);
        setColoniasDisponibles([]);

        setFormData((prev: any) => ({
          ...prev,
          estado_region: "",
          municipio: "",
          colonia: ""
        }));

        setErrorSepomex("Error al consultar el código postal.");
      } finally {
        setCargandoSepomex(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.codigo_postal, setFormData]);

  /* ===================================== */
  /* CENTRAR MAPA POR ESTADO + MUNICIPIO + COLONIA */
  /* ===================================== */
  useEffect(() => {
    const estado = formData.estado_region?.trim();
    const municipio = formData.municipio?.trim();
    const colonia = formData.colonia?.trim();

    if (formData.poligono?.polygon?.length) return;
    if (!estado || !municipio || !colonia) return;

    const timer = setTimeout(async () => {
      try {
        setCargandoMapa(true);

        const consulta = [colonia, municipio, estado, "México"]
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
          setFormData((prev: any) => ({
            ...prev,
            mapCenter: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
          }));
        }
      } catch (error) {
        console.error("Error centrando mapa por ubicación:", error);
      } finally {
        setCargandoMapa(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.estado_region,
    formData.municipio,
    formData.colonia,
    formData.poligono,
    setFormData
  ]);

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
      mapCenter: null,
      poligono: null
    });

    setMunicipiosDisponibles([]);
    setColoniasDisponibles([]);
    setBusquedaEstado("");
    setMostrarEstados(false);
  };

  /* ===================================== */
  /* CAMBIO DE CAMPOS DE UBICACIÓN         */
  /* ===================================== */
  const actualizarUbicacion = (campo: string, valor: string) => {
    if (campo === "codigo_postal") {
      setFormData({
        ...formData,
        codigo_postal: valor,
        estado_region: "",
        municipio: "",
        colonia: "",
        mapCenter: null,
        poligono: null
      });
      return;
    }

    if (campo === "municipio") {
      setFormData({
        ...formData,
        municipio: valor,
        colonia: "",
        mapCenter: null,
        poligono: null
      });
      return;
    }

    if (campo === "colonia") {
      setFormData({
        ...formData,
        colonia: valor,
        mapCenter: null,
        poligono: null
      });
      return;
    }

    setFormData({
      ...formData,
      [campo]: valor
    });
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
          Completa la ubicación general del terreno. El mapa se actualizará con base en código postal, estado, municipio y colonia.
        </p>
      </div>

      <div className="rounded-2xl border border-[#817d58]/20 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CÓDIGO POSTAL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Código postal <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Ej. 37260"
              value={formData.codigo_postal}
              onChange={(e) =>
                actualizarUbicacion("codigo_postal", e.target.value)
              }
              className={`${clasesInputBase} ${clasesInputActiva}`}
            />

            {cargandoSepomex && (
              <p className="mt-2 text-xs text-[#817d58]">
                Consultando código postal...
              </p>
            )}

            {errorSepomex && (
              <p className="mt-2 text-xs text-red-600">
                {errorSepomex}
              </p>
            )}
          </div>

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
                {formData.estado_region || "Selecciona un estado"}
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

            <select
              value={formData.municipio}
              disabled={!formData.estado_region}
              onChange={(e) =>
                actualizarUbicacion("municipio", e.target.value)
              }
              className={`${clasesInputBase} ${
                formData.estado_region ? clasesInputActiva : clasesInputBloqueada
              }`}
            >
              <option value="">
                {formData.estado_region
                  ? "Selecciona un municipio"
                  : "Primero selecciona un estado"}
              </option>

              {municipiosDisponibles.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </div>

          {/* COLONIA */}
          <div>
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Colonia o barrio <span className="text-red-500">*</span>
            </label>

            <select
              value={formData.colonia}
              disabled={!formData.municipio}
              onChange={(e) =>
                actualizarUbicacion("colonia", e.target.value)
              }
              className={`${clasesInputBase} ${
                formData.municipio ? clasesInputActiva : clasesInputBloqueada
              }`}
            >
              <option value="">
                {formData.municipio
                  ? "Selecciona una colonia"
                  : "Primero selecciona un municipio"}
              </option>

              {coloniasDisponibles.map((colonia) => (
                <option key={colonia} value={colonia}>
                  {colonia}
                </option>
              ))}
            </select>
          </div>

          {/* DIRECCIÓN / REFERENCIA */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#22341c] mb-2">
              Calle o referencia aproximada
            </label>

            <input
              type="text"
              placeholder="Ej. Camino vecinal, frente al pozo, a 500 m de la carretera..."
              value={formData.direccion}
              disabled={!formData.estado_region}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  direccion: e.target.value
                })
              }
              className={`${clasesInputBase} ${
                formData.estado_region ? clasesInputActiva : clasesInputBloqueada
              }`}
            />
          </div>
        </div>
      </div>

      {cargandoMapa && (
        <div className="rounded-xl border border-[#828d4b]/20 bg-[#828d4b]/5 px-4 py-3 text-sm text-[#817d58]">
          Actualizando mapa según estado, municipio y colonia...
        </div>
      )}

      <div className="space-y-6">
        <MapaComponent
          mapCenter={mapCenter}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
}