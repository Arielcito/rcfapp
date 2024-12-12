import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Lun", total: 5 },
  { name: "Mar", total: 8 },
  { name: "Mié", total: 7 },
  { name: "Jue", total: 10 },
  { name: "Vie", total: 12 },
  { name: "Sáb", total: 15 },
  { name: "Dom", total: 14 },
]

export function ResumenSemana() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Resumen de la Semana</CardTitle>
        <CardDescription>Número de reservas por día</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

