"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfileMenu() {
  const { user } = useAuth();

  const fotoPerfilUrl = useMemo(() => {
    if (!user?.foto_perfil) return "";

    const cacheKey = user.foto_cache_key ?? "default";
    return `${API_URL}${user.foto_perfil}?t=${cacheKey}`;
  }, [user?.foto_perfil, user?.foto_cache_key]);

  const nombreMostrar = user?.nombre || user?.email || "Perfil";

  return (
    <div className="flex cursor-pointer items-center gap-3 transition hover:opacity-80">
      {fotoPerfilUrl ? (
        <Image
          src={fotoPerfilUrl}
          alt="Perfil"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          {(user?.nombre?.[0] || "P").toUpperCase()}
        </div>
      )}

      <span className="text-sm font-medium text-white">
        {nombreMostrar}
      </span>
    </div>
  );
}