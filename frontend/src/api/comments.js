import { API_BASE_URL, parseJson } from './client.js'

const STORAGE_TOKEN_KEY = 'authToken'

function readAuthToken() {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY) ?? null
  } catch {
    return null
  }
}

function getErrorMessage(data, status) {
  if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim()
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0]
    if (typeof first?.message === 'string' && first.message.trim()) return first.message.trim()
  }
  return `HTTP ${status}`
}

async function requestComments(path, { method = 'GET', payload, signal } = {}) {
  const headers = new Headers({ Accept: 'application/json' })
  const token = readAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const init = { method, headers, signal }
  if (payload !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(payload)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch (error) {
    const networkError = new Error('Network request failed')
    networkError.cause = error
    networkError.isNetworkError = true
    throw networkError
  }

  const data = await parseJson(response)
  if (!response.ok) {
    const error = new Error(getErrorMessage(data, response.status))
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function getComments({ issueKey, signal } = {}) {
  if (!issueKey) throw new Error('issueKey is required')
  const encodedIssueKey = encodeURIComponent(issueKey)
  const data = await requestComments(`/api/issues/${encodedIssueKey}/comments`, { signal })
  return Array.isArray(data) ? data : []
}

export async function postComment({ issueKey, payload, signal } = {}) {
  if (!issueKey) throw new Error('issueKey is required')
  if (!payload || typeof payload !== 'object') throw new Error('payload is required')

  const encodedIssueKey = encodeURIComponent(issueKey)
  const data = await requestComments(`/api/issues/${encodedIssueKey}/comments`, {
    method: 'POST',
    payload,
    signal,
  })
  return data && typeof data === 'object' ? data : null
}
