"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ContactarVendedorModal from "@/components/terrenos/contactarVendedorModal";

interface Props {
  terrenoId: number;
}

export default function TerrenoContactoActions({ terrenoId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [openLeadModal, setOpenLeadModal] = useState(false);

  useEffect(() => {
    if (loading) return;

    const action = searchParams.get("action");

    if (user && user.rol === "usuario" && action === "contactar") {
      setOpenLeadModal(true);
    }
  }, [user, loading, searchParams]);

  const limpiarActionDeUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");

    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;

    router.replace(newUrl);
  };

  const handleContactar = () => {
    if (loading) return;

    if (!user) {
      const redirect = `${pathname}?action=contactar`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (user.rol !== "usuario") {
      return;
    }

    setOpenLeadModal(true);
  };

  const handleCloseModal = () => {
    setOpenLeadModal(false);

    if (searchParams.get("action") === "contactar") {
      limpiarActionDeUrl();
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={handleContactar}
        disabled={loading}
        className="w-full rounded-2xl bg-[#22341c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#828d4b] disabled:opacity-60"
      >
        Contactar vendedor
      </button>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#817d58]/25 bg-white px-5 py-3.5 text-sm font-semibold text-[#22341c] transition hover:bg-[#9f885c]/10"
      >
        <Bookmark size={16} />
        Guardar favorito
      </button>

      <ContactarVendedorModal
        open={openLeadModal}
        onClose={handleCloseModal}
        terrenoId={terrenoId}
        nombreInicial={`${user?.nombre || ""} ${user?.apellido || ""}`.trim()}
        emailInicial={user?.email || ""}
      />
    </>
  );
}