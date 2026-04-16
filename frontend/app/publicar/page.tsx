import PublicarForm from "@/components/publicar/publicarForm";
import PublicarAccessGuard from "@/components/suscripciones/publicarAccessGuard";

export default function PublicarPage() {
  return (
    <PublicarAccessGuard>
      <div className="min-h-[calc(100dvh-var(--navbar-safe-offset))] bg-gray-50 py-10">
        <PublicarForm />
      </div>
    </PublicarAccessGuard>
  );
}
