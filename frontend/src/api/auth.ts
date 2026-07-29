import { apiRequest } from './client'
import type { TokenResponse, User } from '../types'

export function registerUser(input: {
  name: string
  email: string
  password: string
}) {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: input,
  })
}

export function loginUser(email: string, password: string) {
  // Backend login form field is called "username", but we put email there.
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    form: true,
    body: { username: email, password },
  })
}
