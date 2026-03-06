export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Usuarios Totales</h3>
          <p className="text-2xl font-bold mt-2">120</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Terrenos Activos</h3>
          <p className="text-2xl font-bold mt-2">58</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500">Pendientes Aprobación</h3>
          <p className="text-2xl font-bold mt-2">7</p>
        </div>

      </div>
    </div>
  );
}