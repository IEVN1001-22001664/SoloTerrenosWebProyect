"use client";
import { useMemo, useState } from "react";
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

  const [openLeadModalManual, setOpenLeadModalManual] = useState(false);

  const openFromQuery = useMemo(() => {
    if (loading) return false;

    const action = searchParams.get("action");
    return Boolean(user && user.rol === "usuario" && action === "contactar");
  }, [user, loading, searchParams]);

  const openLeadModal = openLeadModalManual || openFromQuery;

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

    setOpenLeadModalManual(true);
  };

  const handleCloseModal = () => {
    setOpenLeadModalManual(false);

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