import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, { message: "El nombre del producto debe contener al menos 3 caracteres." })
    .max(150, { message: "El nombre no puede superar los 150 caracteres." })
    .trim(),
  slug: z.string().optional(),
  description: z
    .string()
    .min(10, { message: "La descripcion debe contener al menos 10 caracteres." })
    .max(3000, { message: "La descripcion no puede superar los 3000 caracteres." })
    .trim(),
  specifications: z.string().optional(),
  price: z
    .coerce
    .number()
    .positive({ message: "El precio unitario debe ser un valor positivo." }),
  comparePrice: z
    .coerce
    .number()
    .positive({ message: "El precio de comparacion debe ser positivo." })
    .optional()
    .nullable(),
  stock: z
    .coerce
    .number()
    .int({ message: "La cantidad en stock debe ser un numero entero." })
    .min(0, { message: "El stock no puede ser un valor negativo." }),
  sku: z
    .string()
    .min(3, { message: "El codigo SKU debe contener al menos 3 caracteres." })
    .max(50, { message: "El SKU no puede exceder 50 caracteres." })
    .trim(),
  imageUrl: z
    .string()
    .url({ message: "La URL de la imagen principal debe ser valida." })
    .trim(),
  category: z
    .string()
    .min(2, { message: "Seleccione una categoria valida." })
    .trim(),
  featured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
});

export type ProductInput = z.infer<typeof productSchema>;
