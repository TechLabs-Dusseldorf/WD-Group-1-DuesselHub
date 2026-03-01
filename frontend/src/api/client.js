export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001'

export async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const STORAGE_TOKEN_KEY = 'authToken'

function readAuthToken() {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY) ?? null
  } catch {
    return null
  }
}

function buildError(res, data) {
  const message = data?.message ? String(data.message) : `HTTP ${res.status}`
  const err = new Error(message)
  err.status = res.status
  err.data = data
  return err
}

export async function apiRequest(
  path,
  { method = 'GET', headers, body, signal, withAuth = true } = {},
) {
  const url = `${API_BASE_URL}${path}`

  const finalHeaders = new Headers(headers ?? {})
  finalHeaders.set('Accept', 'application/json')

  if (withAuth) {
    const token = readAuthToken()
    if (token && !finalHeaders.has('Authorization')) {
      finalHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const init = { method, headers: finalHeaders, signal }

  if (body instanceof FormData) {
    init.body = body
  } else if (body !== undefined) {
    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json')
    }
    init.body = body != null ? JSON.stringify(body) : undefined
  }

  const res = await fetch(url, init)
  const data = await parseJson(res)
  if (!res.ok) throw buildError(res, data)
  return data
}

export async function httpGet(path, { signal } = {}) {
  return await apiRequest(path, { method: 'GET', signal })
}

export async function httpPost(path, body, { signal } = {}) {
  return await apiRequest(path, { method: 'POST', body, signal })
}

export async function httpPatch(path, body, { signal } = {}) {
  return await apiRequest(path, { method: 'PATCH', body, signal })
}