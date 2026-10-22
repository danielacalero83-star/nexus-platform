import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/order";

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: "Debe autenticarse para consultar sus pedidos." },
        { status: 401 }
      );
    }

    // Si es ADMIN obtiene todas las ordenes; si es USER solo las propias
    const where = session.role === "ADMIN" ? {} : { userId: session.userId };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error al obtener ordenes:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar las ordenes de compra." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: "Debe iniciar sesion para completar la transaccion de compra." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Los datos de la orden de compra son invalidos.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { customerName, customerEmail, shippingAddress, paymentMethod, items } = validation.data;

    // Ejecutar la creacion de orden en una transaccion atomica
    const newOrder = await prisma.$transaction(async (tx: any) => {
      let subtotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`El producto con identificador ${item.productId} no fue encontrado.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Existencias insuficientes para '${product.name}'. Solicitado: ${item.quantity}, Disponible: ${product.stock}.`
          );
        }

        // Descontar inventario en tiempo real
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });

        const lineSubtotal = product.price * item.quantity;
        subtotal += lineSubtotal;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        });
      }

      // Calculo de impuestos (13% IVA) y envio
      const tax = Math.round(subtotal * 0.13 * 100) / 100;
      const shippingCost = subtotal > 1000 ? 0.0 : 45.0;
      const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

      // Generacion de correlativo unico de orden
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const timestampPart = Date.now().toString().slice(-4);
      const orderNumber = `ORD-${new Date().getFullYear()}-${timestampPart}${randomPart}`;

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          customerName,
          customerEmail,
          shippingAddress,
          subtotal,
          tax,
          shippingCost,
          total,
          status: "COMPLETED",
          paymentMethod,
          paymentStatus: "PAID",
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        message: "Orden de compra generada y procesada exitosamente.",
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error al procesar la orden:", error);
    const message = error instanceof Error ? error.message : "Error interno al procesar el pedido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const { orderId, status } = await request.json();

    const allowedStatuses = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "El estado proporcionado es invalido." },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({
      message: "Estado de orden actualizado exitosamente.",
      order: updated,
    });
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el estado de la orden." },
      { status: 500 }
    );
  }
}
