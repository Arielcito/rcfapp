import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getOwnerBookings } from "@/api/reservas"

interface ReservaOwner {
  id: string;
  fechaHora: string;
  duracion: number;
  precioTotal: string;
  estadoPago: string;
  metodoPago: string;
  notasAdicionales: string;
  cancha: {
    id: string;
    nombre: string;
    tipo: string;
    tipoSuperficie: string;
    dimensiones: string;
  };
  predio: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

interface ReservasOwnerProps {
  ownerId: string;
}

export function ReservasOwner({ ownerId }: ReservasOwnerProps) {
  const [reservas, setReservas] = useState<ReservaOwner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarReservas = async () => {
      try {
        setIsLoading(true)
        const data = await getOwnerBookings(ownerId)
        console.log(data)
        setReservas(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar las reservas")
        console.error("Error al cargar las reservas:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (ownerId) {
      cargarReservas()
    }
  }, [ownerId])

  if (error) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Reservas Futuras</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Reservas Futuras</CardTitle>
        <CardDescription>Próximas reservas programadas en tus canchas</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))
          ) : (
            reservas.map((reserva) => (
              <div key={reserva.id} className="mb-6 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className={`flex h-2 w-2 translate-y-1 rounded-full ${
                  reserva.estadoPago === 'PENDIENTE' ? 'bg-yellow-500' :
                  reserva.estadoPago === 'CONFIRMADO' ? 'bg-green-500' :
                  'bg-red-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {reserva.cancha.nombre} - {reserva.cancha.tipo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(reserva.fechaHora).toLocaleDateString()} a las {new Date(reserva.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duración: {reserva.duracion} minutos | Precio: ${reserva.precioTotal}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estado: {reserva.estadoPago.toLowerCase()} | Método de pago: {reserva.metodoPago || 'No especificado'}
                  </p>
                  {reserva.notasAdicionales && (
                    <p className="text-sm text-muted-foreground">
                      Notas: {reserva.notasAdicionales}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 