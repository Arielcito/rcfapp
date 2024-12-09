'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import DashboardAdmin from '@/components/Dashboard/DashboardAdmin'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 Dashboard: Estado actual:', {
      loading,
      user
    });

    if (!loading && !user) {
      console.log('❌ No hay usuario, redirigiendo...');
      router.push('/')
    } else if (!loading && user) {
      console.log('✅ Usuario verificado');
    }
  }, [user, loading, router])

  if (loading) {
    console.log('⏳ Dashboard: Cargando...');
    return <div>Cargando...</div>
  }

  if (!user) {
    console.log('🚫 Dashboard: Acceso denegado');
    return null
  }

  console.log('🎉 Dashboard: Renderizando componente');
  return <DashboardAdmin />
}
