"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { FaMapMarkedAlt } from "react-icons/fa";
import FavoriteButton from "@/components/terrenos/favoriteButton";

interface Props {
  terrenoId: number;
  titulo: string;
  ubicacion: string;
  googleMapsUrl?: string | null;
}

interface IconButtonProps {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}

function IconButton({
  children,
  label,
  onClick,
  href,
}: IconButtonProps) {
  const commonClass =
    "group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#817d58]/15 bg-white text-[#22341c] shadow-sm transition hover:bg-[#f3f0e8]";

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClass}
        aria-label={label}
        title={label}
      >
        {children}

        <span className="pointer-events-none absolute -top-11 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#22341c] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
          {label}
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={commonClass}
      aria-label={label}
      title={label}
    >
      {children}

      <span className="pointer-events-none absolute -top-11 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#22341c] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
        {label}
      </span>
    </button>
  );
}

export default function TerrenoQuickActions({
  terrenoId,
  titulo,
  ubicacion,
  googleMapsUrl,
}: Props) {
  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const shareText = `${titulo} - ${ubicacion}`;

  const compartirNativo = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        currentUrl
      ) {
        await navigator.share({
          title: titulo,
          text: shareText,
          url: currentUrl,
        });
        return;
      }

      if (currentUrl) {
        await navigator.clipboard.writeText(currentUrl);
      }
    } catch (error) {
      console.error("Error compartiendo:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="group relative">
        <FavoriteButton
          terrenoId={terrenoId}
          iconOnly
          redirectTo={`/terrenos/${terrenoId}`}
          className="h-12 w-12 rounded-2xl border border-[#817d58]/15 bg-white text-[#22341c] shadow-sm transition hover:bg-[#f3f0e8]"
          activeClassName="h-12 w-12 rounded-2xl border border-[#9f885c]/25 bg-[#9f885c]/15 text-[#22341c] shadow-sm"
          inactiveClassName="h-12 w-12 rounded-2xl border border-[#817d58]/15 bg-white text-[#22341c] shadow-sm"
        />

        <span className="pointer-events-none absolute -top-11 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#22341c] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
          Favoritos
        </span>
      </div>

      <IconButton label="Compartir" onClick={compartirNativo}>
        <Share2 size={18} />
      </IconButton>

      {googleMapsUrl ? (
        <IconButton label="Abrir en Google Maps" href={googleMapsUrl}>
          <FaMapMarkedAlt size={18} />
        </IconButton>
      ) : null}
    </div>
  );
}