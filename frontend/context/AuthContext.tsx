"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

interface User {
  id: number;
  rol: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  foto_perfil?: string | null;
  foto_cache_key?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser((prev) => {
        const incomingUser = data.user;

        // conserva la cache key previa si ya existe
        const fotoCacheKey =
          prev?.foto_cache_key ??
          (incomingUser?.foto_perfil ? Date.now() : undefined);

        return {
          ...incomingUser,
          foto_cache_key: fotoCacheKey,
        };
      });
    } catch (error) {
      console.error("Error refrescando usuario:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshUser]);

  const login = useCallback((userData: User) => {
    setUser({
      ...userData,
      foto_cache_key: Date.now(),
    });
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      setUser,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};