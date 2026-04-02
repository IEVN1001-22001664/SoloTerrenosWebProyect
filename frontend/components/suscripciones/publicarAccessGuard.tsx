"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CapacidadPublicacion {
  ok: boolean;
  motivo: string;
  codigo: string;
  rol?: string;
  limiteTerrenos: number | null;
  terrenosUsados: number;
  suscripcion: {
    id: number;
    estado: string;
    plan_codigo?: string | null;
    plan_nombre?: string | null;
    fecha_fin?: string | null;
  } | null;
}

interface Props {
  children: React.ReactNode;
}

export default function PublicarAccessGuard({ children }: Props) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    const verificarAcceso = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const res = await fetch(
          `${apiUrl}/api/suscripciones/capacidad-publicacion`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        let data: CapacidadPublicacion | null = null;

        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!activo) return;

        if (res.ok && data?.ok) {
          setVerificando(false);
          return;
        }

        // Usuario sin sesión o sin capacidad evaluable
        if (!data) {
          router.replace("/planes");
          return;
        }

        // Usuario normal sin suscripción: llevar a planes
        if (data.codigo === "SIN_SUSCRIPCION" || data.rol === "usuario") {
          const params = new URLSearchParams();
          params.set("origen", "publicar");
          params.set("mensaje", "Necesitas convertirte en colaborador para publicar terrenos.");
          router.replace(`/planes?${params.toString()}`);
          return;
        }

        // Colaborador/admin con bloqueo real: llevar a suscripciones
        const params = new URLSearchParams();

        if (data.codigo) params.set("bloqueo", data.codigo);
        if (data.motivo) params.set("motivo", data.motivo);

        router.replace(`/suscripciones?${params.toString()}`);
      } catch (error) {
        console.error("Error validando acceso a publicar:", error);
        router.replace(
          "/planes?origen=publicar&mensaje=Necesitas convertirte en colaborador para publicar terrenos."
        );
      }
    };

    verificarAcceso();

    return () => {
      activo = false;
    };
  }, [router]);

  if (verificando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="rounded-2xl border border-[#d9dccd] bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center gap-3 text-[#22341c]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm font-medium">
              Verificando permisos de publicación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}