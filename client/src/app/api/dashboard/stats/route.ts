import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const predioId = req.nextUrl.searchParams.get('predioId');
    if (!predioId) {
      return NextResponse.json({ error: "Predio ID is required" }, { status: 400 });
    }
    const totalCanchas = await prisma.cancha.count({
      where: {
        predioId: predioId // Filtrar por el predio actual
      }
    });

    // Estadísticas generales
    const totalReservas = await prisma.reserva.count();
    
    // Ingresos totales
    const ingresosTotales = await prisma.pago.aggregate({
      _sum: {
        monto: true
      }
    });

    // Reservas por mes (últimos 6 meses)
    const reservasPorMes = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "fechaReserva") as mes,
             COUNT(*) as total
      FROM "Reserva"
      WHERE "fechaReserva" > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "fechaReserva")
      ORDER BY mes DESC
    `;

    // Reservas por estado de pago
    const reservasPorEstado = await prisma.reserva.groupBy({
      by: ['estadoPago'],
      _count: true
    });

    // Canchas más reservadas
    const canchasMasReservadas = await prisma.reserva.groupBy({
      by: ['canchaId'],
      _count: true,
      orderBy: {
        _count: {
          canchaId: 'desc'
        }
      },
      take: 5
    });

    // Próximas reservas con datos de usuario y cancha
    const proximasReservas = await prisma.reserva.findMany({
      where: {
        fechaHora: {
          gte: new Date(), // Solo reservas futuras
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        cancha: {
          select: {
            nombre: true,
          }
        }
      },
      orderBy: {
        fechaHora: 'asc'
      },
      take: 5 // Limitamos a 5 reservas
    });

    return NextResponse.json({
      totalCanchas,
      totalReservas,
      ingresosTotales: ingresosTotales._sum.monto || 0,
      reservasPorMes,
      reservasPorEstado,
      canchasMasReservadas,
      proximasReservas
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
} 