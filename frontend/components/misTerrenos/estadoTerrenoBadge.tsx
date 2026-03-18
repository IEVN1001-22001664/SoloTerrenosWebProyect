interface Props {
  estado: string;
}

export default function EstadoTerrenoBadge({ estado }: Props) {
  const estadoNormalizado = estado?.toLowerCase() || "pendiente";

  const estilos = {
    aprobado: "bg-green-100 text-green-700 border-green-200",
    pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
    rechazado: "bg-red-100 text-red-700 border-red-200",
    pausado: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const clase =
    estilos[estadoNormalizado as keyof typeof estilos] ||
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${clase}`}
    >
      {estado}
    </span>
  );
}