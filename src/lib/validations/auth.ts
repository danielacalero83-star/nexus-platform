import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe contener al menos 2 caracteres." })
    .max(100, { message: "El nombre no puede exceder 100 caracteres." })
    .trim(),
  email: z
    .string()
    .email({ message: "Ingrese una direccion de correo electronico valida." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "La contrasena debe tener al menos 8 caracteres." })
    .regex(/[A-Z]/, { message: "La contrasena debe incluir al menos una letra mayuscula." })
    .regex(/[0-9]/, { message: "La contrasena debe incluir al menos un numero." })
    .regex(/[^A-Za-z0-9]/, { message: "La contrasena debe incluir al menos un caracter especial." }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Ingrese una direccion de correo electronico valida." })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, { message: "La contrasena es obligatoria." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
