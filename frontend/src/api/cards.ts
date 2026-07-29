import { apiRequest } from './client'
import type { CreditCard, CreditCardCreate, CreditCardMetrics } from '../types'

export function listCards(token: string) {
  return apiRequest<CreditCard[]>('/cards', { token })
}

export function createCard(token: string, input: CreditCardCreate) {
  return apiRequest<CreditCard>('/cards', {
    method: 'POST',
    token,
    body: input,
  })
}

export function getCardMetrics(token: string, cardId: number) {
  return apiRequest<CreditCardMetrics>(`/cards/${cardId}/metrics`, { token })
}
