/**
 * Shared TypeScript types.
 * These mirror what the backend JSON looks like.
 */

export type User = {
  id: number
  name: string
  email: string
  created_at: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export type CreditCard = {
  id: number
  card_name: string
  credit_limit: string
  balance: string
  statement_day: number
  due_day: number
  created_at: string
}

export type CreditCardMetrics = {
  card_id: number
  card_name: string
  balance: string
  credit_limit: string
  utilization: number
  utilization_percent: number
  status: string
  amount_to_pay_for_10_percent: string
}

export type CreditCardCreate = {
  card_name: string
  credit_limit: number
  balance: number
  statement_day: number
  due_day: number
}
