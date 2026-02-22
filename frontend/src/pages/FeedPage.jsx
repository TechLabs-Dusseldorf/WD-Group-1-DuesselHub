import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar.jsx'
import { SortChips } from '../components/SortChips.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { IssueList } from '../components/IssueList.jsx'
import { useIssues } from '../hooks/useIssues.js'
import { ReportIssueModal } from '../components/ReportIssueModal.jsx'

const SORT_STORAGE_KEY = 'feed.sortKey'
const DEFAULT_SORT_KEY = 'newest'
const ALLOWED_SORT_KEYS = new Set(['newest', 'most-endorsed', 'hottest'])

export function FeedPage() {
  const [sortKey, setSortKey] = useState(() => {
    const storedSortKey = localStorage.getItem(SORT_STORAGE_KEY)
    return ALLOWED_SORT_KEYS.has(storedSortKey) ? storedSortKey : DEFAULT_SORT_KEY
  })
  const { issues, loading, error, sortError, voteError, clearVoteError, reload, handleVote } =
    useIssues(sortKey)
  const [isReportOpen, setIsReportOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortKey)
  }, [sortKey])

  useEffect(() => {
    if (!voteError) return
    const timeoutId = window.setTimeout(() => {
      clearVoteError()
    }, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [voteError, clearVoteError])

  function handleReportIssue() {
    setIsReportOpen(true)
  }
  const handleCloseReport = () => setIsReportOpen(false)


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
          {loading && <LoadingState />}

          {!loading && error && (
            <ErrorState message={error} onReload={reload} onReport={handleReportIssue} />
          )}

          {!loading && !error && issues.length === 0 && (
            <EmptyState onReload={reload} onReport={handleReportIssue} />
          )}

          {!loading && !error && issues.length > 0 && (
            <IssueList issues={issues} onVote={handleVote} />
          )}
        </section>
      </main>
      {voteError && (
        <div className="toast toast--error" role="status" aria-live="polite">
          {voteError}
        </div>
      )}
      <ReportIssueModal open={isReportOpen} onClose={handleCloseReport} onSubmitted={reload} />
    </div>
  )
}