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

export type CreditCardUpdate = Partial<CreditCardCreate>

export type SimulatePaymentResult = {
  card_id: number
  card_name: string
  payment: string
  before_balance: string
  before_utilization_percent: number
  before_status: string
  after_balance: string
  after_utilization_percent: number
  after_status: string
  explanation: string
}

export type Insight = {
  kind: string
  code: string
  severity: 'high' | 'medium' | 'low' | 'info' | string
  title: string
  message: string
  card_id?: number | null
  card_name?: string | null
  days_until_statement?: number | null
  days_until_due?: number | null
  amount_to_pay?: string | null
  action_path?: string | null
}

export type InsightsResponse = {
  items: Insight[]
}
