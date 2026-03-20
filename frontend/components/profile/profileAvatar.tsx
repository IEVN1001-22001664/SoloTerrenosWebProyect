"use client";

import { Camera, User } from "lucide-react";

type Props = {
  imageUrl?: string | null;
  size?: number;
  editable?: boolean;
  onEdit?: () => void;
};

export default function ProfileAvatar({
  imageUrl,
  size = 120,
  editable = false,
  onEdit,
}: Props) {
  return (
    <div
      className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#e8e5de]"
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Foto de perfil"
          className="h-full w-full object-cover"
        />
      ) : (
        <User
          size={size * 0.42}
          className="text-[#22341c]"
          strokeWidth={1.8}
        />
      )}

      {editable && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#22341c] text-white shadow-md transition hover:scale-105"
          aria-label="Cambiar foto de perfil"
        >
          <Camera size={18} />
        </button>
      )}
    </div>
  );
}