"use client";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export default function InfoLegal({ formData, setFormData }: Props) {
  /* ============================= */
  /* MANEJAR CAMBIOS               */
  /* ============================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ============================= */
  /* SUBIR DOCUMENTOS              */
  /* ============================= */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const nuevosArchivos = Array.from(e.target.files);

    setFormData({
      ...formData,
      documentos: [...(formData.documentos || []), ...nuevosArchivos],
    });

    /* limpiar input para permitir volver a elegir el mismo archivo si se elimina */
    e.target.value = "";
  };

  /* ============================= */
  /* ELIMINAR DOCUMENTO            */
  /* ============================= */
  const eliminarDocumento = (index: number) => {
    const nuevosDocumentos = [...(formData.documentos || [])];
    nuevosDocumentos.splice(index, 1);

    setFormData({
      ...formData,
      documentos: nuevosDocumentos,
    });
  };

  /* ============================= */
  /* FORMATEAR TAMAÑO              */
  /* ============================= */
  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#817d58]/30 bg-[#fafaf7] p-6 text-center transition hover:border-[#828d4b] hover:bg-[#f4f6ef]">

        <div className="text-2xl mb-2">📄</div>

        <p className="text-sm font-medium text-[#22341c]">
          Subir documentos
        </p>

        <p className="text-xs text-[#817d58]">
          PDF, imágenes o planos
        </p>

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFile}
          className="hidden"
        />

      </label>



        <p className="text-xs text-[#817d58]">
          Puedes subir escrituras, planos o documentos relacionados.
        </p>

        {/* LISTA DE DOCUMENTOS CARGADOS */}
        {formData.documentos && formData.documentos.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {formData.documentos.map((archivo: File, index: number) => (
              <div
                key={`${archivo.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[#817d58]/25 bg-[#fafaf7] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#22341c] truncate">
                    {archivo.name}
                  </p>
                  <p className="text-xs text-[#817d58]">
                    {archivo.type || "Documento"} · {formatearTamano(archivo.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarDocumento(index)}
                  className="ml-4 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}