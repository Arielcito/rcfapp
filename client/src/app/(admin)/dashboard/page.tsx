import DefaultLayout from '@/components/Layouts/DefaultLayout'
import dynamic from 'next/dynamic'

// Importa el componente de forma dinámica con SSR desactivado
const DashboardAdmin = dynamic(
  () => import('@/components/Dashboard/DashboardAdmin'),
  { ssr: false }
)

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <DashboardAdmin />
    </DefaultLayout>
  )
}
