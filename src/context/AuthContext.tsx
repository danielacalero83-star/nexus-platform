"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string, redirectUrl?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, redirectUrl?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, redirectUrl?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error de autenticacion", data.error || "Credenciales invalidas.", "error");
        setIsLoading(false);
        return false;
      }

      setUser(data.user);
      showToast("Bienvenido", `Sesion iniciada como ${data.user.name}.`, "success");

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
      router.refresh();
      return true;
    } catch {
      showToast("Error de conexion", "No fue posible comunicarse con el servidor.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    redirectUrl?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error en el registro", data.error || "No se pudo registrar la cuenta.", "error");
        setIsLoading(false);
        return false;
      }

      setUser(data.user);
      showToast("Registro completado", `Bienvenido a la plataforma, ${data.user.name}.`, "success");

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/products");
      }
      router.refresh();
      return true;
    } catch {
      showToast("Error de conexion", "No fue posible procesar el registro con el servidor.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showToast("Sesion cerrada", "Ha finalizado su sesion de manera segura.", "info");
      router.push("/login");
      router.refresh();
    } catch {
      showToast("Error", "Ocurrio un problema al cerrar la sesion.", "error");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
