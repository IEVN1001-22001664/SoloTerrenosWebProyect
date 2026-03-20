"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { X, Upload, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { getCroppedImg, Area } from "@/src/lib/cropImage";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function ProfileImageModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setFileName("");
      setCrop({ x: 0, y: 0 });
      setZoom(1.2);
      setCroppedAreaPixels(null);
    }
  }, [isOpen]);

  const onCropComplete = useCallback((_: any, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const canSave = useMemo(() => !!imageSrc && !!croppedAreaPixels, [imageSrc, croppedAreaPixels]);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsSaving(true);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "perfil.jpg", {
        type: "image/jpeg",
      });

      await onSave(croppedFile);
      onClose();
    } catch (error) {
      console.error("Error guardando imagen:", error);
      alert("No se pudo guardar la foto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsSaving(true);
      await onDelete();
      onClose();
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("No se pudo eliminar la foto.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-[#24361f]">Cambiar foto</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            type="button"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {!imageSrc ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d6d1c7] bg-[#f7f5f0] p-8 text-center">
              <Upload className="mb-4 text-[#26411f]" size={42} />
              <p className="mb-2 text-lg font-medium text-[#24361f]">
                Selecciona una imagen de perfil
              </p>
              <p className="mb-6 text-sm text-[#7b776d]">
                Formatos recomendados: JPG, PNG o WEBP
              </p>

              <label className="cursor-pointer rounded-full bg-[#26411f] px-6 py-3 text-white hover:bg-[#1c3117] transition">
                Elegir archivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectFile}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-[#1e1e1e]">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-[#24361f]">
                    Archivo seleccionado
                  </p>
                  <div className="rounded-xl bg-[#f5f2eb] px-4 py-3 text-sm text-[#6f6a5f]">
                    {fileName}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#24361f]">Zoom</span>
                    <span className="text-sm text-[#6f6a5f]">{zoom.toFixed(1)}x</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ZoomOut size={18} className="text-[#6f6a5f]" />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-[#26411f]"
                    />
                    <ZoomIn size={18} className="text-[#6f6a5f]" />
                  </div>
                </div>

                <div className="text-sm text-[#7b776d]">
                  Ajusta la imagen moviéndola dentro del círculo y cambia la escala con el control de zoom.
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Eliminar foto
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-gray-300 px-5 py-2.5 text-[#24361f] hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSave || isSaving}
                      className="rounded-full bg-[#26411f] px-5 py-2.5 text-white hover:bg-[#1d3318] disabled:opacity-60"
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}