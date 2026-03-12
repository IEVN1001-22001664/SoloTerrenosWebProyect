"use client";


interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function infoLegal({ formData, setFormData }: Props) {

  /* ============================= */
  /* MANEJAR CAMBIOS              */
  /* ============================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

  };

  /* ============================= */
  /* SUBIR DOCUMENTOS             */
  /* ============================= */

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) return;

    const archivos = Array.from(e.target.files);

    setFormData({
      ...formData,
      documentos: archivos,
    });

  };

  return (

    <div className="flex flex-col gap-6">

      {/* TITULO */}

      <div>

        <h2 className="text-2xl font-semibold text-[#22341c]">
          Información legal
        </h2>

        <p className="text-sm text-[#817d58]">
          Información legal del terreno y documentación disponible.
        </p>

      </div>

      {/* CAMPOS */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* ESCRITURA */}

        <div className="flex flex-col gap-2">

          <label className="font-medium text-[#22341c]">
            Tipo de escritura
          </label>

          <select
            name="escritura"
            value={formData.escritura || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="publica">Escritura pública</option>
            <option value="privada">Escritura privada</option>
            <option value="titulo_propiedad">Título de propiedad</option>
          </select>

        </div>


        {/* ESTATUS LEGAL */}

        <div className="flex flex-col gap-2">

          <label className="font-medium text-[#22341c]">
            Estatus legal
          </label>

          <select
            name="estatus_legal"
            value={formData.estatus_legal || ""}
            onChange={handleChange}
            className="border border-[#817d58]/40 rounded-lg p-3"
          >
            <option value="">Seleccionar</option>
            <option value="regularizado">Regularizado</option>
            <option value="en_proceso">En proceso de regularización</option>
            <option value="sin_regularizar">Sin regularizar</option>
          </select>

        </div>

      </div>


      {/* GRAVAMEN */}

      <div className="flex items-center gap-3">

        <input
          type="checkbox"
          name="gravamen"
          checked={formData.gravamen || false}
          onChange={handleChange}
          className="w-5 h-5 accent-[#828d4b]"
        />

        <label className="text-[#22341c] font-medium">
          El terreno tiene gravamen
        </label>

      </div>


      {/* DOCUMENTOS */}

      <div className="flex flex-col gap-2">

        <label className="font-medium text-[#22341c]">
          Documentos legales
        </label>

        <input
          type="file"
          multiple
          onChange={handleFile}
          className="border border-[#817d58]/40 rounded-lg p-3"
        />

        <p className="text-xs text-[#817d58]">
          Puedes subir escrituras, planos o documentos relacionados.
        </p>

      </div>

    </div>

  );

}