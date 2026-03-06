import { LatLngTuple } from "leaflet";
import TerrenoMapWrapper from "./TerrenoMapWrapper";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Image from "next/image";

interface Terreno {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  tipo: string;
  poligono?: number[][];
}

async function getTerreno(id: string): Promise<Terreno | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/terrenos/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error("Error al obtener terreno:", error);
    return null;
  }
}

export default async function TerrenoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const terreno = await getTerreno(id);

  if (!terreno) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Terreno no encontrado</h1>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">

      {/* GALERIA */}
      <section className="grid md:grid-cols-4 gap-4 mb-10">

        <div className="md:col-span-2 md:row-span-2 relative h-[420px] rounded-xl overflow-hidden">
          <Image
            src={`https://picsum.photos/800/600?random=${terreno.id}`}
            alt={terreno.titulo}
            fill
            className="object-cover"
          />
        </div>

        {[1,2,3,4].map((i) => (
          <div key={i} className="relative h-[200px] rounded-xl overflow-hidden">
            <Image
              src={`https://picsum.photos/600/400?random=${terreno.id+i}`}
              alt="Imagen terreno"
              fill
              className="object-cover"
            />
          </div>
        ))}

      </section>

      {/* TITULO */}
      <div className="flex justify-between items-start mb-6">

        <div>
          <h1 className="text-3xl font-bold text-[#003554]">
            {terreno.titulo}
          </h1>

          <p className="text-gray-600 mt-2">
            📍 {terreno.ubicacion}
          </p>
        </div>

        {/* FAVORITO */}
        <button className="text-2xl hover:scale-110 transition">
          🤍
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-10">

        {/* INFORMACIÓN */}
        <div className="md:col-span-2">

          {/* DATOS RÁPIDOS */}
          <div className="grid grid-cols-3 gap-6 bg-[#F7FAFC] p-6 rounded-xl mb-8">

            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-semibold">{terreno.tipo}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="font-semibold">{terreno.ubicacion}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold text-green-600">
                Disponible
              </p>
            </div>

          </div>

          {/* DESCRIPCIÓN */}
          <section className="mb-10">

            <h2 className="text-xl font-semibold text-[#003554] mb-3">
              Descripción
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {terreno.descripcion}
            </p>

          </section>

          {/* MAPA */}
          {terreno.poligono && (
            <section>

              <h2 className="text-xl font-semibold text-[#003554] mb-4">
                Ubicación del terreno
              </h2>

              <div className="rounded-xl overflow-hidden">
                <TerrenoMapWrapper
                  coordinates={terreno.poligono as LatLngTuple[]}
                />
              </div>

            </section>
          )}

        </div>

        {/* SIDEBAR */}
        <aside className="border rounded-xl p-6 shadow-md h-fit sticky top-28">

          <p className="text-3xl font-bold text-[#003554] mb-4">
            ${terreno.precio.toLocaleString()} MXN
          </p>

          <button className="w-full bg-[#003554] text-white py-3 rounded-lg mb-3 hover:bg-[#00263d] transition">
            Contactar vendedor
          </button>

          <button className="w-full border border-[#426C8E] text-[#426C8E] py-3 rounded-lg hover:bg-[#99B5D2]/20 transition">
            Guardar favorito
          </button>

          <hr className="my-6" />

          <p className="text-sm text-gray-500 mb-2">
            Acciones
          </p>

          <div className="flex flex-col gap-3">

            <Link
              href={`/terrenos/${terreno.id}/editar`}
              className="bg-gray-800 text-white text-center py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Editar
            </Link>

            <DeleteButton id={terreno.id} />

          </div>

        </aside>

      </div>

    </main>
  );
}