import { httpGet, httpPost, API_BASE_URL } from './client.js'

export async function getIssues({ sortKey, signal } = {}) {
  const data = await httpGet('/api/issues', { signal })
  return Array.isArray(data) ? data : []
}

export async function createIssue(payload, { signal } = {}) {
  return await httpPost('/api/issues', payload, { signal })
}

export async function endorseIssue(issueId, { signal } = {}) {
  if (!issueId) throw new Error('issueId is required')
  return await httpPost(`/api/issues/${encodeURIComponent(issueId)}/endorse`, null, {
    signal,
  })
}

export async function uploadIssuePicture(file, { signal } = {}) {
  if (!(file instanceof File)) {
    throw new Error('file must be a File')
  }
  const formData = new FormData()
  formData.append('picture', file)

  const res = await fetch(`${API_BASE_URL}/api/issues/picture`, {
    method: 'POST',
    body: formData,
    signal,
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return data?.url ?? data?.photoUrl ?? data?.path ?? null
}