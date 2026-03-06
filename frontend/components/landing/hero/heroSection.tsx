import HeroSearchBar from "./heroSearchBar";
import HeroStats from "./heroStats";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center">

      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef')",
        }}
      />

      {/* Overlay verde */}
      <div className="absolute inset-0 bg-[#0f3d2e]/80" />

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-6">

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Encuentra el terreno ideal para tu próximo proyecto
        </h1>

        <p className="text-lg text-gray-200 mt-6 max-w-2xl mx-auto">
          Compra, vende o invierte en terrenos en todo México con la plataforma
          especializada en bienes raíces de mayor crecimiento.
        </p>

        {/* Search Bar */}
        <div className="mt-10">
          <HeroSearchBar />
        </div>

        {/* Stats */}
        <div className="mt-12">
          <HeroStats />
        </div>

      </div>
    </section>
  );
}