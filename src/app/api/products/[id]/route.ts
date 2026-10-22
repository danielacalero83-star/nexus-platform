import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "El producto solicitado no fue encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar el producto." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Los datos de actualizacion son invalidos.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "El producto que intenta actualizar no existe." },
        { status: 404 }
      );
    }

    const data = validation.data;

    // Verificar colision de SKU con otro producto
    if (data.sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id },
        },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: "El codigo SKU ya pertenece a otro producto registrado." },
          { status: 409 }
        );
      }
    }

    // Actualizar slug solo si cambio el nombre
    let finalSlug = existingProduct.slug;
    if (data.name !== existingProduct.name) {
      const baseSlug = slugify(data.name);
      finalSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.product.findFirst({
          where: { slug: finalSlug, NOT: { id } },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: finalSlug,
      },
    });

    return NextResponse.json({
      message: "Producto actualizado correctamente.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el producto." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "El producto a eliminar no existe." },
        { status: 404 }
      );
    }

    // Si el producto tiene ordenes asociadas, no se debe eliminar fisicamente para integridad contable; se archiva
    if (existingProduct.orderItems.length > 0) {
      const archived = await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        message: "El producto posee transacciones historicas vinculadas. Se ha archivado exitosamente para preservar la integridad de datos.",
        product: archived,
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Producto eliminado definitivamente de la base de datos.",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la eliminacion del producto." },
      { status: 500 }
    );
  }
}
