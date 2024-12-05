import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Obtener el predio del usuario
    const predio = await prisma.predio.findFirst({
      where: {
        usuarioId: session.user?.id
      }
    });

    if (!predio) {
      return NextResponse.json(
        { error: "Predio no encontrado" },
        { status: 404 }
      );
    }

    const newCancha = await prisma.cancha.create({
      data: {
        predioId: predio.id,
        nombre: data.nombre,
        tipo: data.tipo,
        capacidadJugadores: data.capacidadJugadores,
        longitud: data.longitud,
        ancho: data.ancho,
        tipoSuperficie: data.tipoSuperficie,
        tieneIluminacion: data.tieneIluminacion,
        esTechada: data.esTechada,
        precioPorHora: data.precioPorHora,
        estado: data.estado,
        equipamientoIncluido: data.equipamientoIncluido,
        imagenUrl: data.imagenUrl
      }
    });

    return NextResponse.json(newCancha);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear la cancha" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que la cancha pertenezca al predio del usuario
    const predio = await prisma.predio.findFirst({
      where: {
        usuarioId: session.user.id,
        canchas: {
          some: {
            id: data.id
          }
        }
      }
    });

    if (!predio) {
      return NextResponse.json(
        { error: "No autorizado para editar esta cancha" },
        { status: 403 }
      );
    }

    const updatedCancha = await prisma.cancha.update({
      where: {
        id: data.id
      },
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        capacidadJugadores: data.capacidadJugadores,
        longitud: data.longitud,
        ancho: data.ancho,
        tipoSuperficie: data.tipoSuperficie,
        tieneIluminacion: data.tieneIluminacion,
        esTechada: data.esTechada,
        precioPorHora: data.precioPorHora,
        estado: data.estado,
        equipamientoIncluido: data.equipamientoIncluido,
        imagenUrl: data.imagenUrl
      }
    });

    return NextResponse.json(updatedCancha);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar la cancha" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID de cancha no proporcionado" },
        { status: 400 }
      );
    }

    // Verificar que la cancha pertenezca al predio del usuario
    const predio = await prisma.predio.findFirst({
      where: {
        usuarioId: session.user.id,
        canchas: {
          some: {
            id: id
          }
        }
      }
    });

    if (!predio) {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta cancha" },
        { status: 403 }
      );
    }

    await prisma.cancha.delete({
      where: {
        id: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar la cancha" },
      { status: 500 }
    );
  }
} 