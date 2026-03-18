"use client";

interface Props {
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroEstado: string;
  setFiltroEstado: (value: string) => void;
  orden: string;
  setOrden: (value: string) => void;
}

export default function FiltrosMisTerrenos({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  orden,
  setOrden,
}: Props) {
  return (
    <div className="mb-8 rounded-2xl border border-[#817d58]/20 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* BUSCADOR */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#22341c]">
            Buscar terreno
          </label>

          <input
            type="text"
            placeholder="Buscar por título, municipio o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="rounded-xl border border-[#817d58]/30 p-3 outline-none transition focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
          />
        </div>

        {/* FILTRO ESTADO */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#22341c]">
            Estado
          </label>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-xl border border-[#817d58]/30 p-3 outline-none transition focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>

        {/* ORDEN */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#22341c]">
            Ordenar por
          </label>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded-xl border border-[#817d58]/30 p-3 outline-none transition focus:border-[#828d4b] focus:ring-2 focus:ring-[#828d4b]/20"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="precio_mayor">Precio mayor</option>
            <option value="precio_menor">Precio menor</option>
            <option value="titulo_az">Título A-Z</option>
            <option value="titulo_za">Título Z-A</option>
          </select>
        </div>
      </div>
    </div>
  );
}