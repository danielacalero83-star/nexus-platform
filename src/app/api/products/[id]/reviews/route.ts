import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations/review";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: "Debe iniciar sesion para publicar una valoracion." },
        { status: 401 }
      );
    }

    const { id: productId } = await params;
    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de la resena invalidos.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "El producto especificado no existe." },
        { status: 404 }
      );
    }

    const { rating, title, comment } = validation.data;

    // Transaccion atomica para crear resena y recalcular promedio
    const result = await prisma.$transaction(async (tx: any) => {
      const review = await tx.review.create({
        data: {
          productId,
          userId: session.userId,
          userName: session.name,
          rating,
          title,
          comment,
        },
      });

      const allReviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalCount = allReviews.length;
      const avgRating =
        allReviews.reduce((sum: number, item: any) => sum + item.rating, 0) / totalCount;
      const roundedAvg = Math.round(avgRating * 10) / 10;

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: roundedAvg,
          reviewCount: totalCount,
        },
      });

      return review;
    });

    return NextResponse.json(
      {
        message: "Valoracion registrada satisfactoriamente.",
        review: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al publicar valoracion:", error);
    return NextResponse.json(
      { error: "Error interno al registrar la valoracion." },
      { status: 500 }
    );
  }
}
