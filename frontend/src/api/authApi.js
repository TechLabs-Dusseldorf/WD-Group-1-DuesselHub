import { API_BASE_URL, parseJson } from './client.js'

export async function loginUser(payload, { signal } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  const data = await parseJson(res)
  if (!res.ok) {
    const message = data?.message ? String(data.message) : `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

export async function registerUser(payload, { signal } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  const data = await parseJson(res)
  if (!res.ok) {
    const message = data?.message ? String(data.message) : `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}
