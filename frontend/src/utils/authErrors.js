import { extractHttpStatus } from './http.js'

export function mapAuthError(err) {
  const status = err?.status ?? extractHttpStatus(err?.message)
  const msg = String(err?.message ?? '').trim()
  const lower = msg.toLowerCase()

  if (msg === 'Failed to fetch' || lower.includes('network')) {
    return 'Network error. Could not reach the server. Check your connection and try again.'
  }

  if (lower.includes('user already exists')) {
    return 'An account with this email already exists. Please log in instead.'
  }
  if (lower.includes('invalid credentials')) {
    return 'Username/email or password is incorrect. Please try again.'
  }
  if (lower.includes('please provide all fields')) {
    return 'Please fill in all required fields.'
  }

  if (status === 400) {
    return `400 Bad Request — ${msg || 'please check your inputs and try again.'}`
  }
  if (status === 401) {
    return '401 Unauthorized — username/email or password is incorrect. Please try again.'
  }
  if (status === 403) {
    return '403 Forbidden — you do not have permission to perform this action.'
  }
  if (status === 404) {
    return '404 Not Found — the requested resource could not be found. Please try again later.'
  }
  if (status === 429) {
    return '429 Too Many Requests — please wait a moment and try again.'
  }
  if (typeof status === 'number' && status >= 500) {
    return `${status} Server Error — something went wrong on our end. Please try again in a moment.`
  }

  return msg || 'Something went wrong. Please try again.'
}
