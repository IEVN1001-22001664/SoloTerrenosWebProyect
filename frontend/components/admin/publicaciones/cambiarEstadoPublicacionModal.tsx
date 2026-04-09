"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (mensaje: string) => Promise<void>;
  titulo: string;
  estadoDestino: string;
  requiereMensaje?: boolean;
  loading?: boolean;
}

export default function CambiarEstadoPublicacionModal({
  open,
  onClose,
  onConfirm,
  titulo,
  estadoDestino,
  requiereMensaje = false,
  loading = false,
}: Props) {
  const [mensaje, setMensaje] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setMensaje("");
    onClose();
  };

  const handleConfirm = async () => {
    const mensajeLimpio = mensaje.trim();

    if (requiereMensaje && !mensajeLimpio) return;

    await onConfirm(mensajeLimpio);
    setMensaje("");
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Cambiar estado de publicación
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Terreno: <span className="font-medium text-slate-700">{titulo}</span>
            </p>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            Estado destino:{" "}
            <span className="font-semibold capitalize">{estadoDestino}</span>
          </div>

          {requiereMensaje ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mensaje / observación
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={5}
                placeholder="Explica al colaborador por qué la publicación fue rechazada..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
              />
              <p className="mt-2 text-xs text-slate-500">
                Este mensaje se enviará como observación al colaborador.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading || (requiereMensaje && !mensaje.trim())}
            className="rounded-xl bg-[#22341c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#828d4b] disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Confirmar cambio"}
          </button>
        </div>
      </div>
    </div>
  );
}