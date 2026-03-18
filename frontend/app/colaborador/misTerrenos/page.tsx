"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MisTerrenosLista from "@/components/misTerrenos/misTerrenosLista";
import FiltrosMisTerrenos from "@/components/misTerrenos/filtrosMisTerrenos";

export default function MisTerrenosPage() {
  const [terrenos, setTerrenos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    const obtenerMisTerrenos = async () => {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/terrenos/mis-terrenos",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "No se pudieron cargar tus terrenos.");
          setTerrenos([]);
          return;
        }

        setTerrenos(data);
      } catch (error) {
        console.error("Error cargando mis terrenos:", error);
        setError("Error de conexión al cargar tus terrenos.");
        setTerrenos([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerMisTerrenos();
  }, []);

  const actualizarEstadoTerreno = (id: number, nuevoEstado: string) => {
    setTerrenos((prev) =>
      prev.map((terreno) =>
        terreno.id === id
          ? { ...terreno, estado: nuevoEstado }
          : terreno
      )
    );
  };

  const eliminarTerrenoDeLista = (id: number) => {
    setTerrenos((prev) => prev.filter((terreno) => terreno.id !== id));
  };

  const terrenosFiltrados = useMemo(() => {
    let resultado = [...terrenos];

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((terreno) => {
        const titulo = (terreno.titulo || "").toLowerCase();
        const municipio = (terreno.municipio || "").toLowerCase();
        const estadoRegion = (terreno.estado_region || "").toLowerCase();
        const tipo = (terreno.tipo || "").toLowerCase();

        return (
          titulo.includes(texto) ||
          municipio.includes(texto) ||
          estadoRegion.includes(texto) ||
          tipo.includes(texto)
        );
      });
    }

    if (filtroEstado !== "todos") {
      resultado = resultado.filter(
        (terreno) => (terreno.estado || "").toLowerCase() === filtroEstado
      );
    }

    resultado.sort((a, b) => {
      switch (orden) {
        case "antiguos":
          return (
            new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
          );

        case "precio_mayor":
          return Number(b.precio || 0) - Number(a.precio || 0);

        case "precio_menor":
          return Number(a.precio || 0) - Number(b.precio || 0);

        case "titulo_az":
          return (a.titulo || "").localeCompare(b.titulo || "");

        case "titulo_za":
          return (b.titulo || "").localeCompare(a.titulo || "");

        case "recientes":
        default:
          return (
            new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
          );
      }
    });

    return resultado;
  }, [terrenos, busqueda, filtroEstado, orden]);

  const totalTerrenos = terrenos.length;

  const totalAprobados = useMemo(
    () =>
      terrenos.filter(
        (t) => (t.estado || "").toLowerCase() === "aprobado"
      ).length,
    [terrenos]
  );

  const totalPendientes = useMemo(
    () =>
      terrenos.filter(
        (t) => (t.estado || "").toLowerCase() === "pendiente"
      ).length,
    [terrenos]
  );

  const totalPausados = useMemo(
    () =>
      terrenos.filter(
        (t) => (t.estado || "").toLowerCase() === "pausado"
      ).length,
    [terrenos]
  );

  return (
    <main className="min-h-screen bg-[#f8f8f5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#22341c]">
              Mis terrenos
            </h1>

            <p className="mt-2 text-sm text-[#817d58]">
              Administra las publicaciones vinculadas a tu cuenta.
            </p>
          </div>

          <Link
            href="/publicar"
            className="inline-flex rounded-xl bg-[#22341c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
          >
            + Publicar nuevo terreno
          </Link>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#817d58]/20 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Total de terrenos</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {totalTerrenos}
            </p>
          </div>

          <div className="rounded-2xl border border-[#817d58]/20 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Aprobados</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {totalAprobados}
            </p>
          </div>

          <div className="rounded-2xl border border-[#817d58]/20 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {totalPendientes}
            </p>
          </div>

          <div className="rounded-2xl border border-[#817d58]/20 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#817d58]">Pausados</p>
            <p className="mt-2 text-2xl font-bold text-[#22341c]">
              {totalPausados}
            </p>
          </div>
        </div>

        {/* FILTROS */}
        {!cargando && !error && (
          <FiltrosMisTerrenos
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            orden={orden}
            setOrden={setOrden}
          />
        )}

        {/* ESTADOS */}
        {cargando && (
          <div className="rounded-2xl border border-[#817d58]/20 bg-white p-10 text-center text-[#817d58] shadow-sm">
            Cargando terrenos...
          </div>
        )}

        {!cargando && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!cargando && !error && (
          <>
            <div className="mb-5 text-sm text-[#817d58]">
              Mostrando {terrenosFiltrados.length} de {terrenos.length} terrenos
            </div>

            <MisTerrenosLista
              terrenos={terrenosFiltrados}
              onEstadoChange={actualizarEstadoTerreno}
              onDelete={eliminarTerrenoDeLista}
            />
          </>
        )}
      </div>
    </main>
  );
}