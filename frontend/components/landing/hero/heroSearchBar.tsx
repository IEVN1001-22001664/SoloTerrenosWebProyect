"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function HeroSearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Buscar:", query);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row items-center overflow-hidden">

      <input
        type="text"
        placeholder="Buscar terrenos por ubicación, superficie o tipo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 px-6 py-4 outline-none text-gray-700"
      />

      <button
        onClick={handleSearch}
        className="flex items-center gap-2 bg-[#2e7d32] hover:bg-[#256628] text-white px-6 py-4 transition"
      >
        <Search size={18} />
        Buscar
      </button>

    </div>
  );
}