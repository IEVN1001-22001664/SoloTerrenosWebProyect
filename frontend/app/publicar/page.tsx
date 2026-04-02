import PublicarForm from "@/components/publicar/publicarForm";
import PublicarAccessGuard from "@/components/suscripciones/publicarAccessGuard";

export default function PublicarPage() {
  return (
    <PublicarAccessGuard>
      <div className="min-h-screen bg-gray-50 py-10">
        <PublicarForm />
      </div>
    </PublicarAccessGuard>
  );
}