import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Ene", total: 1500 },
  { name: "Feb", total: 1800 },
  { name: "Mar", total: 2200 },
  { name: "Abr", total: 2500 },
  { name: "May", total: 2800 },
  { name: "Jun", total: 3200 },
  { name: "Jul", total: 3500 },
]

export function GraficoDineroGanado() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Ingresos</CardTitle>
        <CardDescription>Ingresos mensuales en pesos</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
            <Tooltip
              contentStyle={{ background: '#f1f5f9', border: 'none', borderRadius: '4px' }}
              labelStyle={{ color: '#0f172a' }}
              formatter={(value) => [`$${value}`, 'Total']}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

