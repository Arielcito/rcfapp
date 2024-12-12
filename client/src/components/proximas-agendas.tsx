import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const agendas = [
  { id: 1, fecha: "2024-03-10", hora: "18:00", cancha: "Cancha 1", equipo: "Los Tigres" },
  { id: 2, fecha: "2024-03-10", hora: "20:00", cancha: "Cancha 2", equipo: "Las Águilas" },
  { id: 3, fecha: "2024-03-11", hora: "19:00", cancha: "Cancha 1", equipo: "Los Leones" },
  { id: 4, fecha: "2024-03-12", hora: "21:00", cancha: "Cancha 3", equipo: "Los Pumas" },
  { id: 5, fecha: "2024-03-13", hora: "18:00", cancha: "Cancha 2", equipo: "Los Halcones" },
]

export function ProximasAgendas() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Próximas Agendas</CardTitle>
        <CardDescription>Reservas programadas para los próximos días</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {agendas.map((agenda) => (
            <div key={agenda.id} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {agenda.equipo} - {agenda.cancha}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(agenda.fecha).toLocaleDateString()} a las {agenda.hora}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

