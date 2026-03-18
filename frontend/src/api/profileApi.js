import { apiRequest } from './client.js'

const PROFILE_ENDPOINT = '/api/users/profile'

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

export async function getCurrentUserProfile({ signal } = {}) {
  const data = await apiRequest(PROFILE_ENDPOINT, { method: 'GET', signal })
  const user = normalizeUser(data)
  if (!user) throw new Error('Invalid profile response.')
  return user
}

export async function updateCurrentUserProfile(payload, { signal } = {}) {
  const requestPayload = payload ?? {}
  const hasPasswordChange = Boolean(requestPayload.newPassword ?? requestPayload.password)
  const nextPassword = String(requestPayload.newPassword ?? requestPayload.password ?? '')
  const currentPassword = String(requestPayload.currentPassword ?? requestPayload.oldPassword ?? '')
  const hasProfileFields =
    Object.prototype.hasOwnProperty.call(requestPayload, 'username') ||
    Object.prototype.hasOwnProperty.call(requestPayload, 'email')

  if (hasPasswordChange) {
    if (!nextPassword || !currentPassword) {
      throw new Error('Please provide your current password and a new password.')
    }
    try {
      await apiRequest('/api/users/profile/password', {
        method: 'PUT',
        body: { oldPassword: currentPassword, newPassword: nextPassword },
        signal,
      })
    } catch (err) {
      const message = String(err?.message ?? '').trim()
      if (!message) {
        throw new Error('Password update failed. Please try again.')
      }
      throw err
    }
  }

  if (hasProfileFields) {
    const baseProfilePayload = {
      username: requestPayload.username,
      email: requestPayload.email,
    }
    const profileData = await apiRequest(PROFILE_ENDPOINT, {
      method: 'PUT',
      body: baseProfilePayload,
      signal,
    })
    const user = normalizeUser(profileData)
    if (!user) throw new Error('Invalid profile update response.')
    return user
  }

  const data = await apiRequest(PROFILE_ENDPOINT, { method: 'GET', signal })
  const user = normalizeUser(data)
  if (!user) throw new Error('Invalid profile response.')
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
