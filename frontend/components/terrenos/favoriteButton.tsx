"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

type FavoriteButtonProps = {
  terrenoId: number;
  size?: number;
  iconOnly?: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  stopPropagation?: boolean;
  redirectTo?: string;
};

export default function FavoriteButton({
  terrenoId,
  size = 18,
  iconOnly = true,
  className = "",
  activeClassName = "bg-red-50 text-red-600 border-red-200",
  inactiveClassName = "bg-white text-[#22341c] border-[#817d58]/15",
  stopPropagation = true,
  redirectTo,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [esFavorito, setEsFavorito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user || user.rol !== "usuario") {
      setEsFavorito(false);
      return;
    }

    verificarFavorito();
  }, [loading, user, terrenoId]);

  const verificarFavorito = async () => {
    try {
      setVerificando(true);

      const response = await fetch(
        `${API_URL}/api/favoritos/${terrenoId}/check`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        setEsFavorito(false);
        return;
      }

      const data = await response.json();
      setEsFavorito(!!data.esFavorito);
    } catch (error) {
      console.error("Error verificando favorito:", error);
      setEsFavorito(false);
    } finally {
      setVerificando(false);
    }
  };

  const handleToggleFavorito = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (loading) return;

    if (!user) {
      toast.info("Necesitas iniciar sesión para guardar favoritos.");
      router.push(
        `/login?redirect=${encodeURIComponent(
            redirectTo || `/terrenos/${terrenoId}`
        )}`
    );
      return;
    }

    if (user.rol !== "usuario") {
      toast.error("Solo las cuentas de usuario pueden guardar favoritos.");
      return;
    }

    try {
      setCargando(true);

      const response = await fetch(
        `${API_URL}/api/favoritos/${terrenoId}/toggle`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error("No se pudo actualizar el favorito.", {
          description: data.message || "Inténtalo nuevamente.",
        });
        return;
      }

      setEsFavorito(!!data.esFavorito);

      toast.success(
        data.esFavorito
          ? "Terreno agregado a favoritos."
          : "Terreno eliminado de favoritos."
      );
    } catch (error) {
      console.error("Error actualizando favorito:", error);
      toast.error("Ocurrió un error al actualizar favoritos.");
    } finally {
      setCargando(false);
    }
  };

  const estadoClase = esFavorito ? activeClassName : inactiveClassName;

  return (
    <button
      type="button"
      onClick={handleToggleFavorito}
      disabled={cargando || verificando}
      aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      title={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`inline-flex items-center justify-center rounded-full border transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 ${
        iconOnly ? "h-10 w-10" : "gap-2 px-4 py-2"
      } ${estadoClase} ${className}`}
    >
      <Heart
        size={size}
        className={esFavorito ? "fill-current" : ""}
      />
      {!iconOnly && (
        <span className="text-sm font-medium">
          {esFavorito ? "Guardado" : "Favorito"}
        </span>
      )}
    </button>
  );
}