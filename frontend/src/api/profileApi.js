import { apiRequest } from './client.js'

const PROFILE_ENDPOINTS = ['/api/auth/me', '/api/users/me', '/api/auth/profile']

function normalizeUser(data) {
  if (!data) return null
  const user = data.user ?? data.data?.user ?? data.data ?? data
  if (!user || typeof user !== 'object') return null

  return {
    id: user.id ?? user._id ?? null,
    username: user.username ?? '',
    email: user.email ?? '',
    role: user.role ?? null,
  }
}

function shouldTryNextEndpoint(err) {
  return err?.status === 404 || err?.status === 405
}

async function tryProfileRequest(method, body, { signal } = {}) {
  let lastError = null

  for (const path of PROFILE_ENDPOINTS) {
    try {
      return await apiRequest(path, { method, body, signal })
    } catch (err) {
      lastError = err
      if (!shouldTryNextEndpoint(err)) throw err
    }
  }

  throw lastError ?? new Error('Unable to load profile.')
}

export async function getCurrentUserProfile({ signal } = {}) {
  const data = await tryProfileRequest('GET', undefined, { signal })
  const user = normalizeUser(data)
  if (!user) throw new Error('Invalid profile response.')
  return user
}

export async function updateCurrentUserProfile(payload, { signal } = {}) {
  const data = await tryProfileRequest('PATCH', payload, { signal })
  const user = normalizeUser(data)
  if (!user) throw new Error('Invalid profile update response.')
  return user
}

export async function verifyCurrentPassword(currentPassword, { signal } = {}) {
  const data = await apiRequest('/api/auth/verify-password', {
    method: 'POST',
    body: { currentPassword },
    signal,
  })
  return Boolean(data?.ok)
}
