"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      login(data.user);

      const rol = data.user.rol;

      setTimeout(() => {
        if (rol === "usuario") {
          if (redirect) {
            router.push(redirect);
          } else {
            router.push("/");
          }
        } else if (rol === "colaborador") {
          router.push("/colaborador");
        } else if (rol === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 600);
    } catch (error) {
      setError("Error del servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#22341c] flex items-center justify-center px-4 relative overflow-hidden">
      {loading && (
        <div className="fixed inset-0 bg-[#22341c] z-50 flex items-center justify-center transition-opacity duration-500">
          <div className="flex flex-col items-center gap-6 animate-fadeIn">
            <div className="w-14 h-14 border-4 border-[#9f885c] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg tracking-wide animate-pulse">
              Iniciando sesión...
            </p>
          </div>
        </div>
      )}

      <div className="absolute w-96 h-96 bg-[#9f885c] opacity-20 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-[#828d4b] opacity-20 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 text-white border border-white/20 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-2 text-center tracking-wide">
          Bienvenido
        </h1>

        <p className="text-center text-gray-300 mb-8 text-sm">
          Ingresa para acceder al sistema
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 text-white placeholder-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c] transition-all duration-300"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c] transition-all duration-300 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center animate-pulse">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-4 h-4 accent-[#828d4b]"
            />
            <label>Recordarme</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-xl font-semibold tracking-wide shadow-lg bg-[#828d4b] hover:bg-[#817d58] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() =>
              router.push(
                redirect
                  ? `/register?redirect=${encodeURIComponent(redirect)}`
                  : "/register"
              )
            }
            className="text-[#9f885c] hover:underline font-semibold"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}