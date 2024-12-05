import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Asumiendo que el usuario tiene un predioId asociado o que manejas un solo predio
    const predio = await prisma.predio.findFirst({
      where: {
        usuarioId: session.user.id,
      },
      select: {
        id: true,
        nombre: true,
        horarioApertura: true,
        horarioCierre: true,
      },
    });

    if (!predio) {
      return NextResponse.json({ error: 'Predio no encontrado' }, { status: 404 });
    }

    const canchas = await prisma.cancha.findMany({
      where: {
        predioId: predio.id,
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        predioId: true,
      },
    });

    const reservas = await prisma.reserva.findMany({
      where: {
        cancha: {
          predioId: predio.id,
        },
        // Puedes agregar filtros adicionales aquí, como fecha
      },
      select: {
        id: true,
        fechaHora: true,
        duracion: true,
        estadoPago: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        cancha: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json({
      predio,
      canchas,
      reservas,
    });

  } catch (error) {
    console.error('Error en calendar API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 