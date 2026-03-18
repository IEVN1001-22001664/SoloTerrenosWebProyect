import Link from "next/link";

export default function EmptyMisTerrenos() {
  return (
    <div className="rounded-2xl border border-dashed border-[#817d58]/30 bg-white p-10 text-center shadow-sm">
      <div className="mb-4 text-4xl">📍</div>

      <h3 className="text-xl font-semibold text-[#22341c]">
        Aún no tienes terrenos publicados
      </h3>

      <p className="mt-2 text-sm text-[#817d58]">
        Cuando publiques tu primer terreno, aparecerá aquí para que puedas administrarlo.
      </p>

      <Link
        href="/publicar"
        className="mt-6 inline-flex rounded-xl bg-[#22341c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#828d4b]"
      >
        Publicar nuevo terreno
      </Link>
    </div>
  );
}