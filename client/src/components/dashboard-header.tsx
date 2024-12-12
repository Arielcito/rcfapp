import { ClubIcon as Soccer } from 'lucide-react'

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between space-y-2 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex items-center space-x-2">
        <Soccer className="h-6 w-6" />
        <span className="text-xl font-semibold">Administración de Canchas de Fútbol</span>
      </div>
    </div>
  )
}

