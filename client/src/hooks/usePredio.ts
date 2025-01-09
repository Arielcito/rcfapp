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
      console.log('[usePredio] Iniciando cierre de sesión')
      await api.post('/users/auth/logout')
      await authLogout()
      router.push('/')
      console.log('[usePredio] Sesión cerrada exitosamente')
    } catch (err) {
      console.error('[usePredio] Error al cerrar sesión:', err)
      throw new Error('Error al cerrar sesión')
    }
  }

  const fetchPredio = useCallback(async () => {
    if (!user?.id) {
      console.log('[usePredio] No hay usuario autenticado')
      setIsLoading(false)
      return
    }

    try {
      console.log('[usePredio] Iniciando búsqueda de predio para usuario:', user.id)
      setIsLoading(true)
      const response = await api.get(`/api/predios/usuario/${user.id}`)
      console.log('[usePredio] Respuesta del servidor:', {
        status: response.status,
        ok: response.status === 200
      })

      const predios = response.data
      console.log('[usePredio] Predios obtenidos:', predios)
      setPredio(predios[0] || null)
      console.log('[usePredio] Predio seleccionado:', predios[0] || 'ninguno')
    } catch (err) {
      console.error('[usePredio] Error al obtener predio:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido'))
      setPredio(null)
    } finally {
      setIsLoading(false)
      console.log('[usePredio] Finalizada búsqueda de predio')
    }
  }, [user?.id])

  useEffect(() => {
    console.log('[usePredio] useEffect ejecutado, usuario:', user?.id)
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