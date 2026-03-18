"use client";

import { ReactNode, useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "warning" | "danger" | "success";
  icon?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  icon,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const styles = {
    default: {
      iconBg: "bg-slate-100",
      iconText: "text-slate-700",
      confirmBtn: "bg-[#22341c] hover:bg-[#2d4724] text-white",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    danger: {
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    success: {
      iconBg: "bg-green-100",
      iconText: "text-green-700",
      confirmBtn: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      {/* Caja modal */}
      <div className="relative z-[101] w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl animate-[modalPop_.18s_ease-out]">
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${currentStyle.iconBg} ${currentStyle.iconText}`}
            >
              {icon ? icon : <span className="text-xl font-bold">!</span>}
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#22341c]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6e6a4b]">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-[#817d58]/25 px-5 py-3 text-sm font-medium text-[#22341c] transition hover:bg-[#f5f5f1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${currentStyle.confirmBtn}`}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalPop {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}