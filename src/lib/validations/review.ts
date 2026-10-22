import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .coerce
    .number()
    .int()
    .min(1, { message: "La calificacion minima es de 1 estrella." })
    .max(5, { message: "La calificacion maxima es de 5 estrellas." }),
  title: z
    .string()
    .min(3, { message: "El titulo de la resena debe tener al menos 3 caracteres." })
    .max(120, { message: "El titulo no debe superar 120 caracteres." })
    .trim(),
  comment: z
    .string()
    .min(10, { message: "El comentario debe contener al menos 10 caracteres." })
    .max(1000, { message: "El comentario no debe superar 1000 caracteres." })
    .trim(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
