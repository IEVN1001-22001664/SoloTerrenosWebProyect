"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  rol: string;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // ⚡ BYPASS PARA REVISIÓN: Usuario logueado por defecto para evitar 404/Login
  const [user, setUser] = useState<User | null>({
    id: 1,
    rol: "admin", // Cambia esto según el rol que quieras mostrar
    nombre: "Usuario Demo",
  });
  
  // ⚡ Cargando en false para que entre directo a la app
  const [loading, setLoading] = useState(false);

  // URL base para el futuro (Vercel usará la variable de entorno, local usará el puerto 5000)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkAuth = async () => {
      // Comentamos la ejecución del fetch para que no falle en Vercel buscando localhost
      /*
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
      */
    };

    // checkAuth(); // Desactivado temporalmente para el despliegue de avance
  }, [API_URL]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    // Solo logout local por ahora para el avance
    setUser(null);
    
    /* await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    */
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};