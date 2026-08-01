import { apiRequest } from './client'
import type {
  CreditCard,
  CreditCardCreate,
  CreditCardMetrics,
  CreditCardUpdate,
  SimulatePaymentResult,
} from '../types'

export function listCards(token: string) {
  return apiRequest<CreditCard[]>('/cards', { token })
}

export function getCard(token: string, cardId: number) {
  return apiRequest<CreditCard>(`/cards/${cardId}`, { token })
}

export function createCard(token: string, input: CreditCardCreate) {
  return apiRequest<CreditCard>('/cards', {
    method: 'POST',
    token,
    body: input,
  })
}

export function updateCard(token: string, cardId: number, input: CreditCardUpdate) {
  return apiRequest<CreditCard>(`/cards/${cardId}`, {
    method: 'PATCH',
    token,
    body: input,
  })
}

export function deleteCard(token: string, cardId: number) {
  return apiRequest<void>(`/cards/${cardId}`, {
    method: 'DELETE',
    token,
  })
}

export function getCardMetrics(token: string, cardId: number) {
  return apiRequest<CreditCardMetrics>(`/cards/${cardId}/metrics`, { token })
}

export function simulatePayment(token: string, cardId: number, payment: number) {
  return apiRequest<SimulatePaymentResult>(`/cards/${cardId}/simulate`, {
    method: 'POST',
    token,
    body: { payment },
  })
}
