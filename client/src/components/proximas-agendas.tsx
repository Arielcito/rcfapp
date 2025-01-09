import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getOwnerBookings, getUserBookings } from "@/api/reservas"
import { useAuth } from "@/app/context/AuthContext"

interface Reserva {
  appointmentId: string;
  place: {
    name: string;
    description: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  estado: string;
}

export function ProximasAgendas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  useEffect(() => {
    const cargarReservas = async () => {
      try {
        setIsLoading(true)
        const data = await getOwnerBookings(user?.id || '')
        setReservas(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar las reservas")
        console.error("Error al cargar las reservas:", err)
      } finally {
        setIsLoading(false)
      }
    }

    cargarReservas()
  }, [])

  if (error) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Próximas Agendas</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Próximas Agendas</CardTitle>
        <CardDescription>Reservas programadas para los próximos días</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))
          ) : (
            reservas.map((reserva) => (
              <div key={reserva.appointmentId} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                <span className={`flex h-2 w-2 translate-y-1 rounded-full ${
                  reserva.estado === 'pendiente' ? 'bg-yellow-500' :
                  reserva.estado === 'confirmado' ? 'bg-green-500' :
                  'bg-red-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {reserva.place.name} - {reserva.place.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(reserva.appointmentDate).toLocaleDateString()} a las {reserva.appointmentTime}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

