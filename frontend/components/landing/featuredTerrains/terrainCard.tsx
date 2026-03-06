"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Ruler, Tag } from "lucide-react";
import FavoriteButton from "./favoriteButton";

interface Props {
  id?: string;
  title: string;
  location: string;
  price: string;
  area: string;
  image: string;
  status: string;
  isFavorite?: boolean;
}

export default function TerrainCard({
  id,
  title,
  location,
  price,
  area,
  image,
  status,
  isFavorite = false,
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer group"
    >
      {/* Imagen */}

      <div className="relative h-[220px] overflow-hidden">

        {/* ❤️ FAVORITO */}
        <FavoriteButton
          terrainId={id}
          initialFavorite={isFavorite}
        />

        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Status badge */}

        <span className="absolute top-4 left-4 bg-[#5C7C3A] text-white text-xs px-3 py-1 rounded-full">
          {status}
        </span>
      </div>

      {/* Contenido */}

      <div className="p-5">

        <h3 className="font-semibold text-lg text-[#1F3D2B] mb-2">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
          <MapPin size={16} />
          {location}
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
          <Ruler size={16} />
          {area}
        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2 text-[#5C7C3A] font-semibold">
            <Tag size={16} />
            {price}
          </div>

          <button className="text-sm text-[#5C7C3A] hover:underline">
            Ver más
          </button>

        </div>

      </div>
    </motion.div>
  );
}