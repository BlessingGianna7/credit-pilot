import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { getCardMetrics, listCards } from '../api/cards'
import { useAuth } from '../auth/AuthContext'
import type { CreditCard, CreditCardMetrics } from '../types'

export type CardWithMetrics = CreditCard & { metrics?: CreditCardMetrics }

/**
 * Custom hook = reusable logic with React state.
 * Many pages need "load my cards + metrics", so we put that in one place.
 */
export function useCardsWithMetrics() {
  const { token } = useAuth()
  const [cards, setCards] = useState<CardWithMetrics[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function reload() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const list = await listCards(token)
      const withMetrics = await Promise.all(
        list.map(async (card) => {
          try {
            const metrics = await getCardMetrics(token, card.id)
            return { ...card, metrics }
          } catch {
            return card
          }
        }),
      )
      setCards(withMetrics)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return { cards, error, loading, reload, token }
}
