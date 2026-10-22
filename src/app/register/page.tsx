"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Validaciones en tiempo real de la contrasena
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || name.trim().length < 2) {
      setFormError("El nombre debe contener al menos 2 caracteres.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFormError("Ingrese una direccion de correo electronico valida.");
      return;
    }

    if (!isPasswordValid) {
      setFormError("La contrasena no cumple con los requisitos de seguridad.");
      return;
    }

    const success = await register(name, email, password);
    if (!success) {
      setFormError("No se pudo completar el registro. El correo ya podria estar en uso.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Registro de Usuario
        </h1>
        <p className="text-xs text-slate-400">
          Cree una cuenta para acceder al catalogo corporativo y emitir pedidos.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        {formError && (
          <div className="p-3.5 rounded-xl border border-rose-800/80 bg-rose-950/80 text-rose-300 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ing. Fernando Lopez"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Correo Electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Contrasena de Acceso
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checklist de Requisitos de Contrasena */}
            <div className="mt-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px]">
              <p className="font-semibold text-slate-400">Requisitos minimos de seguridad:</p>
              <div className="grid grid-cols-2 gap-1 text-slate-400">
                <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-400 font-medium" : ""}`}>
                  <Check className="w-3 h-3" /> Minimo 8 caracteres
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? "text-emerald-400 font-medium" : ""}`}>
                  <Check className="w-3 h-3" /> 1 Mayuscula
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-400 font-medium" : ""}`}>
                  <Check className="w-3 h-3" /> 1 Numero
                </span>
                <span className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-400 font-medium" : ""}`}>
                  <Check className="w-3 h-3" /> 1 Caracter especial
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando cuenta...</span>
              </>
            ) : (
              <>
                <span>Crear Cuenta Corporativa</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          <span>Ya cuenta con acceso registrado? </span>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Inicie sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
