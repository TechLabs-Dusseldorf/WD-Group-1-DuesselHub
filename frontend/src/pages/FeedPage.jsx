import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar.jsx'
import { SortChips } from '../components/SortChips.jsx'
import { IssueCard } from '../components/IssueCard.jsx'

function toIssueKey(issue) {
  return `${issue.createdAt ?? ''}::${issue.title ?? ''}::${issue.location ?? ''}`
}

function getIssueKey(issue) {
  return issue?._id ?? issue?.issueKey ?? toIssueKey(issue ?? {})
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001'
function getIssuesEndpoint(sortKey) {
  const key = String(sortKey ?? 'newest')

  switch (key) {
    case 'default':
      return '/api/issues'
    case 'newest':
      return '/api/issues/newest'
    case 'most-endorsed':
      return '/api/issues/most-endorsed'
    case 'hottest':
      return '/api/issues/hottest'
    default:
      return '/api/issues'
  }
}

async function fetchIssues({ signal, sortKey }) {
  const endpoint = getIssuesEndpoint(sortKey)
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { signal })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

async function fetchMockIssues() {
  const mod = await import('../dataMock/mockIssues.js')
  return Array.isArray(mod?.mockIssues) ? mod.mockIssues : []
}

export function FeedPage() {
  const [issues, setIssues] = useState([])
  const [sortKey, setSortKey] = useState('default')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortError, setSortError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  function handleReportIssue() {
    console.log('TODO: Report Issue')
  }

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      setSortError(null)

      try {
        const data = await fetchIssues({ signal: controller.signal, sortKey })
        if (!isActive) return
        setSortError(null)
        setIssues((prevIssues) => {
          const voteByKey = new Map(
            prevIssues.map((i) => [i.issueKey ?? toIssueKey(i), i.myVote ?? 0]),
          )

          return data.map((issue) => {
            const issueKey = getIssueKey(issue)
            return {
              ...issue,
              issueKey,
              myVote: voteByKey.get(issueKey) ?? 0,
              endorsements: issue.endorsements ?? 0,
            }
          })
        })
      } catch (e) {
        if (!isActive) return
        if (e?.name === 'AbortError') return

        setSortError(`Sorting "${sortKey}" failed. Please try again in a moment.`)

        try {
          const data = await fetchMockIssues()
          if (!isActive) return
          setIssues((prevIssues) => {
            const voteByKey = new Map(
              prevIssues.map((i) => [i.issueKey ?? toIssueKey(i), i.myVote ?? 0]),
            )

            return data.map((issue) => {
              const issueKey = getIssueKey(issue)
              return {
                ...issue,
                issueKey,
                myVote: voteByKey.get(issueKey) ?? 0,
                endorsements: issue.endorsements ?? 0,
              }
            })
          })
        } catch {
          setIssues([])
          setError('We couldn’t load issues right now. Please try again in a moment.')
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [sortKey, reloadToken])

  function handleVote(issueKey, direction) {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.issueKey !== issueKey) return issue

        const current = issue.myVote ?? 0
        if (direction !== +1) return issue

        const isRemoving = current === +1
        const nextVote = isRemoving ? 0 : +1
        const delta = isRemoving ? -1 : +1

        return {
          ...issue,
          myVote: nextVote,
          endorsements: Math.max(0, (issue.endorsements ?? 0) + delta),
        }
      }),
    )
  }

  return (
    <div className="app">
      <TopBar onReportIssue={handleReportIssue} />

      <main className="container page">
        <section className="feed-panel" aria-label="Feed header and filters">
          <div className="feed-panel__inner">
            <header className="page-header">
              <div className="page-header__text">
                <h1 className="page-title">Active issues</h1>
                <p className="page-subtitle">All reports from the community</p>
              </div>
            </header>
          </div>

          <div className="feed-panel__filters">
            <section className="controls" aria-label="Feed controls">
              <SortChips value={sortKey} onChange={setSortKey} />
              {sortError && (
                <p className="sort-error" role="status">
                  {sortError}
                </p>
              )}
            </section>
          </div>
        </section>

        <section className="feed" aria-label="Issue feed">
          {loading && (
            <div className="state" aria-busy="true">
              Loading…
            </div>
          )}

          {!loading && error && (
            <div className="state state--error" role="alert">
              <div className="state__title">We couldn’t load issues</div>
              <p className="state__subtitle">{error}</p>
              <div className="state__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setReloadToken((n) => n + 1)}
                >
                  Load again
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleReportIssue}
                >
                  Report issue
                </button>
              </div>
            </div>
          )}

          {!loading && !error && issues.length === 0 && (
            <div className="state state--empty">
              <div className="state__title">No issues exist!</div>
              <p className="state__subtitle">
                There are no reports to show yet.
              </p>
              <div className="state__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setReloadToken((n) => n + 1)}
                >
                  Load again
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleReportIssue}
                >
                  Report issue
                </button>
              </div>
            </div>
          )}

          {!loading && !error && issues.length > 0 && (
            <div className="issue-list">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.issueKey}
                  issue={issue}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

