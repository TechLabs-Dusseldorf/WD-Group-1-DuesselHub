import { apiRequest } from './client.js'

export async function loginUser(payload, { signal } = {}) {
  return await apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
    signal,
    withAuth: false,
  })
}

export async function registerUser(payload, { signal } = {}) {
  return await apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
    signal,
    withAuth: false,
  })
}
