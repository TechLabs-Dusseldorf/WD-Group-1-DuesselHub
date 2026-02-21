import { httpGet, httpPost, API_BASE_URL } from './client.js'

export async function getIssues({ sortKey, signal } = {}) {
  const data = await httpGet('/api/issues', { signal })
  return Array.isArray(data) ? data : []
}

async function parseJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function createIssue(payload, { signal } = {}) {
  if (payload instanceof FormData) {
    const res = await fetch(`${API_BASE_URL}/api/issues`, {
      method: 'POST',
      body: payload,
      signal,
    })
    if (!res.ok) {
      const data = await parseJson(res)
      const message = data?.message ? String(data.message) : `HTTP ${res.status}`
      const err = new Error(message)
      err.status = res.status
      throw err
    }
    return await parseJson(res)
  }
  return await httpPost('/api/issues', payload, { signal })
}

export async function endorseIssue(issueId, { signal } = {}) {
  if (!issueId) throw new Error('issueId is required')
  return await httpPost(`/api/issues/${encodeURIComponent(issueId)}/endorse`, null, {
    signal,
  })
}