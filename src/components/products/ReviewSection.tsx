"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquarePlus, User, Loader2 } from "lucide-react";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  userName: string;
  createdAt: string | Date;
}

interface ReviewSectionProps {
  productId: string;
  initialReviews: ReviewItem[];
  averageRating: number;
  reviewCount: number;
  onReviewAdded?: () => void;
}

export function ReviewSection({
  productId,
  initialReviews,
  averageRating,
  reviewCount,
  onReviewAdded,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Autenticacion requerida", "Inicie sesion para calificar este producto.", "warning");
      return;
    }

    if (title.trim().length < 3) {
      showToast("Titulo requerido", "El titulo debe tener al menos 3 caracteres.", "warning");
      return;
    }

    if (comment.trim().length < 10) {
      showToast("Comentario requerido", "El comentario debe contener al menos 10 caracteres.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error al publicar", data.error || "No se pudo registrar la resena.", "error");
        return;
      }

      showToast("Valoracion registrada", "Gracias por retroalimentar la calidad del equipamiento.", "success");

      setReviews((prev) => [
        {
          id: data.review.id,
          rating: data.review.rating,
          title: data.review.title,
          comment: data.review.comment,
          userName: user.name,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setTitle("");
      setComment("");
      setShowForm(false);

      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch {
      showToast("Error", "Ocurrio un problema de red al enviar la resena.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-sm">
      {/* Resumen de Calificaciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Valoraciones de Ingenieria y Clientes
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Evaluacion de fiabilidad, rendimiento y cumplimiento de especificaciones tecnicas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-amber-400">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-3xl font-extrabold text-white">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Basado en {reviews.length} valoraciones registradas
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                if (!user) {
                  showToast("Sesion necesaria", "Debe iniciar sesion para emitir una valoracion.", "info");
                  return;
                }
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Emitir Valoracion
            </button>
          )}
        </div>
      </div>

      {/* Formulario Interactivo de Calificacion */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-indigo-500/30 bg-slate-950/80 space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">
              Nueva Valoracion Tecnica
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          {/* Selector de Estrellas Interactivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Puntuacion General (1 a 5 Estrellas)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled =
                  (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 transition-colors"
                    aria-label={`Calificar con ${starValue} estrellas`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-semibold text-amber-400">
                {rating} de 5 estrellas
              </span>
            </div>
          </div>

          {/* Titulo */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Titulo de la Resena
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Excelente rendimiento bajo carga sostenida"
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Comentarios y Analisis de Funcionamiento
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Describa la estabilidad, condiciones operativas y ventajas del hardware observado..."
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Guardar Valoracion"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Listado de Resenas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">
            Este producto aun no tiene resenas registradas. Sea el primero en publicar una evaluacion tecnica.
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {rev.userName}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatDate(rev.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i <= rev.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-bold text-slate-300">
                  {rev.rating}/5
                </span>
              </div>

              <h4 className="text-sm font-bold text-white pt-1">
                {rev.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
