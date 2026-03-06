export default function HeroStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">

      <div>
        <p className="text-3xl font-bold">12K+</p>
        <p className="text-sm text-gray-300">Terrenos publicados</p>
      </div>

      <div>
        <p className="text-3xl font-bold">3K+</p>
        <p className="text-sm text-gray-300">Vendedores activos</p>
      </div>

      <div>
        <p className="text-3xl font-bold">98%</p>
        <p className="text-sm text-gray-300">Clientes satisfechos</p>
      </div>

      <div>
        <p className="text-3xl font-bold">24h</p>
        <p className="text-sm text-gray-300">Tiempo promedio de contacto</p>
      </div>

    </div>
  );
}