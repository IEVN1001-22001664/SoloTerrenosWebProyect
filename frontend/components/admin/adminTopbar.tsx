"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import SearchBar from "./searchBar";
import ProfileMenu from "./profileMenu";

export default function AdminTopbar() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 h-16 border-b shadow-sm"
      style={{
        backgroundColor: "#0b4f6c",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex h-full items-center">
        {/* Franja blanca para el logo */}
        <div
          className="flex h-full w-[290px] shrink-0 items-center border-r px-5"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#dbe3ee",
          }}
        >
          <Link href="/admin" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo SoloTerrenos"
              width={130}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 px-5 lg:px-6">
          <div className="hidden max-w-2xl flex-1 md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="relative rounded-xl p-2 text-white/90 transition hover:bg-white/10 hover:text-white">
              <Bell size={20} />
              <span
                className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: "#9f885c",
                  color: "#0f172a",
                }}
              >
                3
              </span>
            </button>

            <ProfileMenu />

            <button className="rounded-xl p-2 text-white/90 transition hover:bg-white/10 hover:text-white">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}