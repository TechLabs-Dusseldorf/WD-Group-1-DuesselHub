import { apiRequest, httpGet, httpPatch, httpPost } from './client.js'

export async function getIssues({ sortKey, signal } = {}) {
  const apiSortValue = sortKey === 'most-endorsed' ? 'most_endorsed' : sortKey
  const params = new URLSearchParams()
  if (apiSortValue) params.set('sort', apiSortValue)
  const query = params.toString()
  const path = query ? `/api/issues?${query}` : '/api/issues'
  const data = await httpGet(path, { signal })
  return Array.isArray(data) ? data : []
}

export async function createIssue(payload, { signal } = {}) {
  if (payload instanceof FormData) {
    return await apiRequest('/api/issues', {
      method: 'POST',
      body: payload,
      signal,
    })
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
