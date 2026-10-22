import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, { message: "ID de producto requerido." }),
  quantity: z.number().int().positive({ message: "La cantidad debe ser mayor a cero." }),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(3, { message: "El nombre completo debe tener al menos 3 caracteres." })
    .max(100, { message: "El nombre no puede superar 100 caracteres." })
    .trim(),
  customerEmail: z
    .string()
    .email({ message: "Ingrese un correo electronico valido." })
    .toLowerCase()
    .trim(),
  shippingAddress: z
    .string()
    .min(10, { message: "La direccion de envio debe tener al menos 10 caracteres." })
    .max(250, { message: "La direccion no debe superar 250 caracteres." })
    .trim(),
  paymentMethod: z
    .enum(["CREDIT_CARD", "TRANSFER", "CORPORATE_CREDIT"])
    .default("CREDIT_CARD"),
  items: z
    .array(orderItemSchema)
    .min(1, { message: "El pedido debe contener al menos un producto." }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
