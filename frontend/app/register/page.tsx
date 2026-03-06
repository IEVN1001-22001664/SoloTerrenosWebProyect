"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";


export default function Register() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
  const isNombreValid = nameRegex.test(nombre);
  const isApellidoValid = nameRegex.test(apellido);
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(fechaNacimiento).getFullYear();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

const isFechaValid =
  birthYear >= 1900 &&
  birthYear <= currentYear - 18;



  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const validatePassword = (value: string) => {
    setPassword(value);

    setPasswordValidations({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
    });
  };
  const calculateStrength = () => {
  let score = 0;

  if (passwordValidations.length) score++;
  if (passwordValidations.uppercase) score++;
  if (passwordValidations.lowercase) score++;
  if (passwordValidations.number) score++;

  return score;
};

const strength = calculateStrength();

  const isPasswordStrong =
    passwordValidations.length &&
    passwordValidations.uppercase &&
    passwordValidations.lowercase &&
    passwordValidations.number;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const isFormValid =
    isNombreValid &&
    isApellidoValid &&
    isFechaValid &&
    isEmailValid &&
    isPasswordStrong &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          fechaNacimiento,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al registrar");
        return;
      }

      alert("Usuario registrado correctamente");
      router.push("/login");

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#22341c] flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute w-96 h-96 bg-[#9f885c] opacity-20 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-[#828d4b] opacity-20 rounded-full blur-3xl animate-pulse bottom-10 right-10"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 text-white border border-white/20">

        <h1 className="text-3xl font-bold mb-2 text-center tracking-wide">
          Crear Cuenta
        </h1>

        <p className="text-center text-gray-300 mb-8 text-sm">
          Regístrate para comenzar
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Nombre y Apellido */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-1/2 bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c]"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-1/2 bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c]"
              required
            />
          </div>
          {nombre && !isNombreValid && (
            <p className="text-red-400 text-sm">
              Nombre inválido (solo letras, mínimo 2 caracteres)
            </p>
          )}

          {/* Fecha nacimiento */}
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c]"
            required
          />
          {fechaNacimiento && !isFechaValid && (
            <p className="text-red-400 text-sm">
              Debes tener al menos 18 años y fecha válida
            </p>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c]"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="w-full bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c] pr-12 transition"
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

          {/* Mostrar solo si el usuario empezó a escribir */}
          {password.length > 0 && (
            <>
              {/* Barra de fuerza */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    strength <= 1
                      ? "bg-red-500 w-1/4"
                      : strength === 2
                      ? "bg-yellow-500 w-2/4"
                      : strength === 3
                      ? "bg-blue-500 w-3/4"
                      : "bg-green-500 w-full"
                  }`}
                ></div>
              </div>

              <p className="text-xs mt-1 text-gray-300">
                {strength <= 1 && "Muy débil"}
                {strength === 2 && "Débil"}
                {strength === 3 && "Buena"}
                {strength === 4 && "Segura"}
              </p>

              {/* Requisitos */}
              <div className="text-sm space-y-1 overflow-hidden mt-2">

                {!passwordValidations.length && (
                  <p className="text-red-400 transition-all duration-300">
                    Mínimo 8 caracteres
                  </p>
                )}

                {!passwordValidations.uppercase && (
                  <p className="text-red-400 transition-all duration-300">
                    Una letra mayúscula
                  </p>
                )}

                {!passwordValidations.lowercase && (
                  <p className="text-red-400 transition-all duration-300">
                    Una letra minúscula
                  </p>
                )}

                {!passwordValidations.number && (
                  <p className="text-red-400 transition-all duration-300">
                    Un número
                  </p>
                )}

              </div>
            </>
          )}
          {/* Confirmar password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/20 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9f885c] pr-12 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-red-400 text-sm">
              Las contraseñas no coinciden
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`py-3 rounded-xl font-semibold transition ${
              isFormValid
                ? "bg-[#828d4b] hover:bg-[#817d58]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[#9f885c] hover:underline font-semibold"
          >
            Inicia sesión
          </button>
        </div>

      </div>
    </div>
  );
}