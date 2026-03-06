"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Terreno {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  tipo: string;
}

export default function TerrenosPage() {

  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    const fetchTerrenos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/terrenos");
        const data = await response.json();
        setTerrenos(data);
      } catch (error) {
        console.error("Error al cargar terrenos:", error);
      }
    };

    fetchTerrenos();
  }, []);

  const toggleFavorito = (id:number) => {
    setFavoritos((prev)=>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev,id]
    );
  };

  return (
    <main className="min-h-screen bg-[#F7F9F6] pt-28 px-6">

      {/* HERO MARKETPLACE */}

      <section className="max-w-7xl mx-auto mb-14 text-center">

        <h1 className="text-4xl font-bold text-[#003554]">
          Encuentra tu terreno ideal
        </h1>

        <p className="text-gray-600 mt-3">
          Explora terrenos disponibles en distintas zonas poblacionales
        </p>

        {/* BUSCADOR */}

        <div className="mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Buscar por ciudad, zona o tipo..."
            className="w-full max-w-xl px-5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#99B5D2]"
          />
        </div>

      </section>

      {/* FILTROS */}

      <section className="max-w-7xl mx-auto mb-10">

        <div className="flex flex-wrap gap-3">

          <button className="px-4 py-2 bg-white border rounded-full hover:bg-[#99B5D2]/20 transition">
            Ubicación
          </button>

          <button className="px-4 py-2 bg-white border rounded-full hover:bg-[#99B5D2]/20 transition">
            Tipo de terreno
          </button>

          <button className="px-4 py-2 bg-white border rounded-full hover:bg-[#99B5D2]/20 transition">
            Precio
          </button>

          <button className="px-4 py-2 bg-white border rounded-full hover:bg-[#99B5D2]/20 transition">
            Tamaño
          </button>

          <button className="px-4 py-2 bg-white border rounded-full hover:bg-[#99B5D2]/20 transition">
            Ordenar
          </button>

        </div>

      </section>

      {/* GRID DE TERRENOS */}

      <section className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {terrenos.map((terreno) => (

            <motion.div
              key={terreno.id}
              initial={{ opacity:0, y:30 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.4 }}
              whileHover={{ y:-6 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >

              {/* IMAGEN */}

              <div className="relative">

                <Image
                  src={`https://picsum.photos/600/400?random=${terreno.id}`}
                  alt={terreno.titulo}
                  width={600}
                  height={400}
                  className="object-cover rounded-lg"
                /> 

                {/* FAVORITO */}

                <button
                  onClick={() => toggleFavorito(terreno.id)}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded-full text-lg hover:scale-110 transition"
                >
                  {favoritos.includes(terreno.id) ? "❤️" : "🤍"}
                </button>

                {/* BADGE */}

                <span className="absolute bottom-3 left-3 bg-[#003554] text-white text-xs px-3 py-1 rounded-full">
                  {terreno.tipo}
                </span>

              </div>

              {/* INFO */}

              <div className="p-5">

                <h2 className="font-semibold text-lg text-[#003554] line-clamp-1">
                  {terreno.titulo}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  📍 {terreno.ubicacion}
                </p>

                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {terreno.descripcion}
                </p>

                {/* PRECIO */}

                <p className="text-xl font-bold text-[#426C8E] mt-3">
                  ${terreno.precio.toLocaleString()} MXN
                </p>

                {/* BOTON */}

                <Link
                  href={`/terrenos/${terreno.id}`}
                  className="mt-4 inline-block w-full text-center bg-[#003554] text-white py-2 rounded-lg hover:bg-[#426C8E] transition"
                >
                  Ver detalle
                </Link>

              </div>

            </motion.div>

          ))}

        </div>

      </section>

      {/* PAGINACION VISUAL */}

      <section className="max-w-7xl mx-auto mt-16 flex justify-center gap-3">

        <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          1
        </button>

        <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          2
        </button>

        <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
          3
        </button>

      </section>

    </main>
  );
}