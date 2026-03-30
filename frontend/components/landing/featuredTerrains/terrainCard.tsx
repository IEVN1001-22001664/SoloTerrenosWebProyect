"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Ruler, Tag } from "lucide-react";
import FavoriteButton from "@/components/terrenos/favoriteButton";

interface Props {
  id: number;
  title: string;
  location: string;
  price: string;
  area: string;
  image: string;
  status: string;
}

export default function TerrainCard({
  id,
  title,
  location,
  price,
  area,
  image,
  status,
}: Props) {
  const router = useRouter();

  const goToDetail = () => {
    router.push(`/terrenos/${id}`);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      tabIndex={0}
      role="button"
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md outline-none focus:ring-2 focus:ring-[#828d4b]/40"
    >
      <div className="relative h-[220px] overflow-hidden">
        <div
          className="absolute right-3 top-3 z-20"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            terrenoId={id}
            size={18}
            className="bg-white/90 shadow-sm backdrop-blur-md"
            activeClassName="bg-white text-[#22341c] border-[#9f885c]/30"
            inactiveClassName="bg-white/90 text-[#22341c] border-[#817d58]/15"
          />
        </div>

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <span className="absolute left-4 top-4 rounded-full bg-[#5C7C3A] px-3 py-1 text-xs text-white">
          {status}
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-lg font-semibold text-[#1F3D2B]">
          {title}
        </h3>

        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <Ruler size={16} />
          <span>{area}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-[#5C7C3A]">
            <Tag size={16} />
            <span>{price}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}