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

      {/* GALERÍA */}

      <section className="mb-10">

        <div className="grid md:grid-cols-4 gap-4">

          <div className="md:col-span-2 md:row-span-2 relative h-[420px] rounded-xl overflow-hidden">
            <Image
              src={`https://picsum.photos/900/700?random=${terreno.id}`}
              alt={terreno.titulo}
              fill
              className="object-cover"
            />
          </div>

          {[1,2,3,4].map((i) => (
            <div
              key={i}
              className="relative h-[200px] rounded-xl overflow-hidden"
            >
              <Image
                src={`https://picsum.photos/600/400?random=${terreno.id+i}`}
                alt="imagen"
                fill
                className="object-cover"
              />
            </div>
          ))}

        </div>

      </section>

      {/* TITULO */}

      <section className="flex justify-between items-start mb-8">

        <div>

          <h1 className="text-3xl font-bold text-[#22341c]">
            {terreno.titulo}
          </h1>

          <p className="text-gray-600 mt-2">
            📍 {terreno.ubicacion}
          </p>

        </div>

        <button className="text-2xl hover:scale-110 transition">
          🤍
        </button>

      </section>

      <div className="grid md:grid-cols-3 gap-10">

        {/* CONTENIDO PRINCIPAL */}

        <div className="md:col-span-2">

          {/* DATOS RÁPIDOS */}

          <div className="grid grid-cols-3 gap-6 bg-[#f6f6f2] border rounded-xl p-6 mb-10">

            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-semibold text-[#22341c]">
                {terreno.tipo}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="font-semibold text-[#22341c]">
                {terreno.ubicacion}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold text-[#828d4b]">
                Disponible
              </p>
            </div>

          </div>

          {/* DESCRIPCIÓN */}

          <section className="mb-12">

            <h2 className="text-xl font-semibold text-[#22341c] mb-4">
              Descripción
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {terreno.descripcion}
            </p>

          </section>

          {/* MAPA */}

          {terreno.poligono && (

            <section className="mb-12">

              <h2 className="text-xl font-semibold text-[#22341c] mb-4">
                Ubicación del terreno
              </h2>

              <div className="h-[380px] rounded-xl overflow-hidden border">

                <TerrenoMapWrapper
                  coordinates={terreno.poligono as LatLngTuple[]}
                />

              </div>

            </section>

          )}

          {/* FICHA TÉCNICA */}

          <section>

            <h2 className="text-xl font-semibold text-[#22341c] mb-6">
              Ficha técnica
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Superficie total
                </p>
                <p className="font-semibold">
                  Por definir
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Frente
                </p>
                <p className="font-semibold">
                  Por definir
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Fondo
                </p>
                <p className="font-semibold">
                  Por definir
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Uso de suelo
                </p>
                <p className="font-semibold">
                  Por definir
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Servicios
                </p>
                <p className="font-semibold">
                  Agua / Luz / Internet
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-gray-500 text-sm">
                  Acceso
                </p>
                <p className="font-semibold">
                  Camino pavimentado
                </p>
              </div>

            </div>

          </section>

        </div>

        {/* SIDEBAR */}

        <aside className="border rounded-xl p-6 shadow-md h-fit sticky top-28">

          <p className="text-3xl font-bold text-[#22341c] mb-4">
            ${terreno.precio.toLocaleString()} MXN
          </p>

          <button className="w-full bg-[#828d4b] text-white py-3 rounded-lg mb-3 hover:bg-[#22341c] transition">
            Contactar vendedor
          </button>

          <button className="w-full border border-[#817d58] text-[#817d58] py-3 rounded-lg hover:bg-[#9f885c]/20 transition">
            Guardar favorito
          </button>

          <hr className="my-6" />

        </aside>

      </div>

    </main>
  );
}