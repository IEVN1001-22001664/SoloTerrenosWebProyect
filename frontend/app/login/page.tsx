import { Suspense } from "react";
import LoginClient from "./loginClient";

function LoginFallback() {
  return (
    <div className="min-h-screen bg-[#22341c] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 text-white border border-white/20">
        <h1 className="text-3xl font-bold mb-2 text-center tracking-wide">
          Bienvenido
        </h1>
        <p className="text-center text-gray-300 mb-8 text-sm">
          Cargando acceso...
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}