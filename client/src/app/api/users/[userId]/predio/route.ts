import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar autenticación
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario solicita su propio predio o es admin
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver este predio' },
        { status: 403 }
      )
    }

    // Buscar el predio donde el usuario es propietario
    const predio = await prisma.predio.findFirst({
      where: {
        OR: [
          { usuarioId: params.userId }, // Si es propietario
          { empleados: { some: { id: params.userId } } } // Si es empleado
        ]
      },
      include: {
        canchas: true,
        empleados: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!predio) {
      return NextResponse.json(
        { error: 'No se encontró ningún predio asociado al usuario' },
        { status: 404 }
      )
    }

    return NextResponse.json(predio)
  } catch (error) {
    console.error('Error al obtener predio del usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener el predio' },
      { status: 500 }
    )
  }
} 