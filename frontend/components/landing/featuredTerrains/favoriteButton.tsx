"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  terrainId?: string;
  initialFavorite?: boolean;
}

export default function FavoriteButton({
  terrainId,
  initialFavorite = false,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // evita que abra la card

    setIsFavorite(!isFavorite);

    try {
      // 🔹 aquí luego conectaremos backend
      /*
      await fetch("/api/favorites/toggle", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ terrainId }),
      });
      */
    } catch (error) {
      console.error("Favorite error", error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md hover:scale-110 transition-all duration-300"
    >
      <Heart
        size={20}
        className={`transition-all duration-300 ${
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-gray-600"
        }`}
      />
    </button>
  );
}