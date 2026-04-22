import HeroSearchBar from "./heroSearchBar";
import HeroStats from "./heroStats";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#22341c]">
      
      {/* Imagen de fondo con Zoom Lento */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef')",
        }}
      />

      {/* Overlay institucional #22341c */}
      <div className="absolute inset-0 bg-[#22341c]/85 backdrop-blur-[1px]" />

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-6">
        
        {/* Etiqueta Superior */}
        <div className="opacity-0 animate-fade-in-up">
          <span className="inline-block text-[#9f885c] uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-xs font-semibold mb-6 md:mb-10">
            BIENVENIDO A
          </span>
        </div>

        {/* Título de Marca - Ajustado para Móvil y Desktop */}
        <div className="mb-8 md:mb-12 opacity-0 animate-fade-in-up delay-1">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-light text-white tracking-tight leading-none">
            SOLO<span className="font-bold text-[#828d4b]">TERRENOS</span>
          </h1>
        </div>

        {/* Subtítulo - Con aire equilibrado */}
        <div className="opacity-0 animate-fade-in-up delay-2">
          <h2 className="text-lg md:text-3xl text-gray-200 font-light max-w-4xl mx-auto leading-tight md:leading-relaxed">
            La inversión más segura para tu <br className="md:hidden" />
            <span className="italic border-b border-[#9f885c]/40">próximo proyecto</span>
          </h2>
        </div>

        {/* Search Bar - Responsive width */}
        <div className="mt-10 md:mt-16 opacity-0 animate-fade-in-up delay-3 w-full max-w-4xl mx-auto">
          <div className="shadow-2xl rounded-full bg-white/5 backdrop-blur-md p-1">
            <HeroSearchBar />
          </div>
        </div>

        {/* Stats - Se ocultan o se ajustan en móvil si es necesario */}
        <div className="mt-16 md:mt-24 opacity-0 animate-fade-in-up delay-4">
          <HeroStats />
        </div>
      </div>

      {/* --- CONTENEDOR DE INDICADORES DE SCROLL --- */}

      {/* 1. VERSIÓN DESKTOP (Mouse Grande) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-4">
        <span className="text-[#9f885c] text-xs uppercase tracking-[0.4em] font-medium opacity-80">
          Desliza para explorar
        </span>
        <div className="w-[34px] h-[58px] border-[3px] border-[#817d58]/40 rounded-full flex justify-center p-2">
          <div className="w-1.5 h-3 bg-[#9f885c] rounded-full animate-bounce shadow-[0_0_10px_#9f885c]" />
        </div>
      </div>

      {/* 2. VERSIÓN MÓVIL (Línea de Gesto Dinámica) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex md:hidden flex-col items-center gap-2">
        <span className="text-[#9f885c] text-[10px] uppercase tracking-[0.3em] font-bold">
          Scroll
        </span>
        {/* Línea animada que "cae" */}
        <div className="w-[2px] h-12 bg-[#817d58]/20 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#9f885c] animate-mobile-scroll" />
        </div>
      </div>

    </section>
  );
}