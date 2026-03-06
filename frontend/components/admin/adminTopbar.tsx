"use client";

import Image from "next/image";
import { Bell, Settings } from "lucide-react";
import SearchBar from "./searchBar";
import ProfileMenu from "./profileMenu";

export default function AdminTopbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#003554] text-white flex items-center justify-between px-6 shadow-md z-50">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>

      {/* CENTER SECTION - SEARCH */}
      <div className="flex-1 max-w-2xl mx-8">
        <SearchBar />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative hover:text-gray-300 transition">
          <Bell size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1.5 rounded-full">
            3
          </span>
        </button>

        {/* Profile */}
        <ProfileMenu />

        {/* Settings */}
        <button className="hover:text-gray-300 transition">
          <Settings size={22} />
        </button>

      </div>
    </header>
  );
}