import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import type { Predio } from '@prisma/client'

interface UsePredioReturn {
  predio: Predio | null
  predioId: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function usePredio(): UsePredioReturn {
  const { data: session, status } = useSession()
  const [predio, setPredio] = useState<Predio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPredio = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${session.user.id}/predio`)
      if (!response.ok) {
        throw new Error('Error al obtener el predio')
      }
      const data = await response.json()
      setPredio(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
      setPredio(null)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPredio()
    }
  }, [status, fetchPredio])

  return {
    predio,
    predioId: predio?.id ?? null,
    isLoading: status === 'loading' || isLoading,
    error,
    refetch: fetchPredio
  }
} 