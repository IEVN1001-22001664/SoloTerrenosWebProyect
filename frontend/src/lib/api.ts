//--------------------------------------
// Helper Profesional API Fetch
//--------------------------------------

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const BASE_URL = "http://localhost:5000";

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include", // 🔥 siempre enviar cookies
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    // 🔥 Manejo automático de sesión expirada
    if (response.status === 401) {
      console.warn("Sesión expirada o no autorizada");

      // Evitar redirección infinita si ya estamos en login
      if (typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }

      throw new Error("Sesión expirada");
    }

    // Manejo general de errores
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || "Error en la petición"
      );
    }

    // Si no hay contenido (ej: DELETE)
    if (response.status === 204) {
      return null;
    }

    return await response.json();

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}