import { apiRequest } from './client'
import type { InsightsResponse } from '../types'

export function getRecommendations(token: string) {
  return apiRequest<InsightsResponse>('/insights/recommendations', { token })
}

export function getReminders(token: string) {
  return apiRequest<InsightsResponse>('/insights/reminders', { token })
}
