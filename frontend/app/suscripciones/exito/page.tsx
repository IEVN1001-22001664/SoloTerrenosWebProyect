import ExitoClient from "../../../components/suscripciones/exitoClient";

interface ExitoPageProps {
  searchParams?: Promise<{
    session_id?: string;
  }>;
}

export default async function ExitoPage({ searchParams }: ExitoPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id || "";

  return <ExitoClient sessionId={sessionId} />;
}