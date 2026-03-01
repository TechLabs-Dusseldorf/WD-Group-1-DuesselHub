import { httpGet, httpPatch, httpPost, API_BASE_URL } from './client.js'

export async function getIssues({ sortKey, signal } = {}) {
  const apiSortValue = sortKey === 'most-endorsed' ? 'most_endorsed' : sortKey
  const params = new URLSearchParams()
  if (apiSortValue) params.set('sort', apiSortValue)
  const query = params.toString()
  const path = query ? `/api/issues?${query}` : '/api/issues'
  const data = await httpGet(path, { signal })
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

export async function endorseIssue(issueId, action, { signal } = {}) {
  if (!issueId) throw new Error('issueId is required')
  if (action !== 'add' && action !== 'remove') {
    throw new Error('action must be "add" or "remove"')
  }
  return await httpPatch(
    `/api/${encodeURIComponent(issueId)}/endorse`,
    { action },
    { signal },
  )
}
