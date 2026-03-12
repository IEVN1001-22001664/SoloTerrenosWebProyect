"use client";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function caracteristicasTerreno({ formData, setFormData }: Props) {

  /* ============================= */
  /* MANEJAR CAMBIOS              */
  /* ============================= */

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {

    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

  };

  return (

    <div className="flex flex-col gap-6">

      {/* TITULO SECCION */}

      <div>
        <h2 className="text-2xl font-semibold text-[#22341c]">
          Características del terreno
        </h2>

        <p className="text-sm text-[#817d58]">
          Define las características físicas y legales del terreno.
        </p>
      </div>


      {/* GRID CAMPOS */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* TOPOGRAFIA */}

        <div className="flex flex-col gap-2">

          <label className="text-[#22341c] font-medium">
            Topografía
          </label>

          <select
            name="topografia"
            value={formData.topografia || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="plano">Plano</option>
            <option value="inclinado">Inclinado</option>
            <option value="accidentado">Accidentado</option>
            <option value="mixto">Mixto</option>
          </select>

        </div>


        {/* FORMA */}

        <div className="flex flex-col gap-2">

          <label className="text-[#22341c] font-medium">
            Forma del terreno
          </label>

          <select
            name="forma"
            value={formData.forma || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
            <option value="rectangular">Rectangular</option>
            <option value="cuadrado">Cuadrado</option>
          </select>

        </div>


        {/* TIPO PROPIEDAD */}

        <div className="flex flex-col gap-2">

          <label className="text-[#22341c] font-medium">
            Tipo de propiedad
          </label>

          <select
            name="tipo_propiedad"
            value={formData.tipo_propiedad || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="privada">Propiedad privada</option>
            <option value="ejidal">Ejidal</option>
            <option value="comunal">Comunal</option>
          </select>

        </div>


        {/* USO DE SUELO */}

        <div className="flex flex-col gap-2">

          <label className="text-[#22341c] font-medium">
            Uso de suelo
          </label>

          <select
            name="uso_suelo"
            value={formData.uso_suelo || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="habitacional">Habitacional</option>
            <option value="comercial">Comercial</option>
            <option value="industrial">Industrial</option>
            <option value="agricola">Agrícola</option>
            <option value="mixto">Mixto</option>
          </select>

        </div>

      </div>


      {/* NEGOCIABLE */}

      <div className="flex items-center gap-3">

        <input
          type="checkbox"
          name="negociable"
          checked={formData.negociable || false}
          onChange={handleChange}
          className="w-5 h-5 accent-[#828d4b]"
        />

        <label className="text-[#22341c] font-medium">
          Precio negociable
        </label>

      </div>

    </div>

  );

}