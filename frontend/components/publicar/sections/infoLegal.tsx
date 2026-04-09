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
    const target = e.target;
    const { name, value } = target;

    setFormData({
      ...formData,
      [name]: target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value,
    });
  };

  /* ============================= */
  /* SUBIR DOCUMENTOS NUEVOS       */
  /* ============================= */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const nuevosArchivos = Array.from(e.target.files);

    setFormData({
      ...formData,
      documentos: [...(formData.documentos || []), ...nuevosArchivos],
    });

    e.target.value = "";
  };

  /* ============================= */
  /* ELIMINAR DOCUMENTO NUEVO      */
  /* ============================= */
  const eliminarDocumentoNuevo = (index: number) => {
    const nuevosDocumentos = [...(formData.documentos || [])];
    nuevosDocumentos.splice(index, 1);

    setFormData({
      ...formData,
      documentos: nuevosDocumentos,
    });
  };

  /* ============================= */
  /* MARCAR DOCUMENTO EXISTENTE    */
  /* PARA ELIMINAR                 */
  /* ============================= */
  const marcarDocumentoExistenteParaEliminar = (documentoId: number) => {
    const yaMarcado = (formData.documentosEliminados || []).includes(documentoId);

    if (yaMarcado) {
      setFormData({
        ...formData,
        documentosEliminados: (formData.documentosEliminados || []).filter(
          (id: number) => id !== documentoId
        ),
      });
      return;
    }

    setFormData({
      ...formData,
      documentosEliminados: [
        ...(formData.documentosEliminados || []),
        documentoId,
      ],
    });
  };

  /* ============================= */
  /* FORMATEAR TAMAÑO              */
  /* ============================= */
  const formatearTamano = (bytes: number) => {
    if (!bytes) return "Tamaño no disponible";
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

      {/* DOCUMENTOS EXISTENTES */}
      {formData.documentosExistentes && formData.documentosExistentes.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="font-medium text-[#22341c]">
            Documentos existentes
          </label>

          {formData.documentosExistentes.map((documento: any) => {
            const eliminado = (formData.documentosEliminados || []).includes(documento.id);

            return (
              <div
                key={documento.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  eliminado
                    ? "border-red-200 bg-red-50 opacity-70"
                    : "border-[#817d58]/25 bg-[#fafaf7]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#22341c]">
                    {documento.nombre_original}
                  </p>
                  <p className="text-xs text-[#817d58]">
                    {documento.tipo_mime || "Documento"} · {formatearTamano(documento.tamano_bytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => marcarDocumentoExistenteParaEliminar(documento.id)}
                  className={`ml-4 rounded-lg px-3 py-2 text-sm transition ${
                    eliminado
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      : "border border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  {eliminado ? "Restaurar" : "Eliminar"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENTOS NUEVOS */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-[#22341c]">
          Agregar documentos legales
        </label>

        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#817d58]/30 bg-[#fafaf7] p-6 text-center transition hover:border-[#828d4b] hover:bg-[#f4f6ef]">
          <div className="mb-2 text-2xl">📄</div>

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

        {/* LISTA DE DOCUMENTOS NUEVOS */}
        {formData.documentos && formData.documentos.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {formData.documentos.map((archivo: File, index: number) => (
              <div
                key={`${archivo.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[#817d58]/25 bg-[#fafaf7] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#22341c]">
                    {archivo.name}
                  </p>
                  <p className="text-xs text-[#817d58]">
                    {archivo.type || "Documento"} · {formatearTamano(archivo.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarDocumentoNuevo(index)}
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