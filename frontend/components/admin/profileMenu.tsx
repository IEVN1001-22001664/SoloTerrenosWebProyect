"use client";

import Image from "next/image";

export default function ProfileMenu() {
  return (
    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
      <Image
        src="/profile.jpg"
        alt="Perfil"
        width={32}
        height={32}
        className="rounded-full object-cover"
      />
      <span className="text-sm font-medium">Admin</span>
    </div>
  );
}