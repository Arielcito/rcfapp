import { useAuth } from '@/app/context/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import type { Predio } from '@prisma/client'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'

interface UsePredioReturn {
  predio: Predio | null
  predioId: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  logout: () => Promise<void>
}

export function usePredio(): UsePredioReturn {
  const { user, logout: authLogout } = useAuth()
  const router = useRouter()
  const [predio, setPredio] = useState<Predio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const logout = async () => {
    try {
      await api.post('/users/auth/logout')
      await authLogout()
      router.push('/')
    } catch (err) {
      throw new Error('Error al cerrar sesión')
    }
  }

  const fetchPredio = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.get(`/api/predios/usuario/${user.id}`)
      const predios = response.data
      setPredio(predios[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
      setPredio(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchPredio()
    }
  }, [user, fetchPredio])

  return {
    predio,
    predioId: predio?.id ?? null,
    isLoading,
    error,
    refetch: fetchPredio,
    logout
  }
} 