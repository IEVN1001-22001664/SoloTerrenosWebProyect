//--------------------------------------
// Helper Profesional API Fetch
//--------------------------------------

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (response.status === 401) {
      console.warn("Sesión expirada o no autorizada");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }

      throw new Error("Sesión expirada");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error en la petición");
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}