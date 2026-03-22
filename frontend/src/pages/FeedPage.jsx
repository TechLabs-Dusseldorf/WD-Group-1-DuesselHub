import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { TopBar } from '../components/TopBar.jsx'
import { SortChips } from '../components/SortChips.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { ErrorState } from '../components/ErrorState.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { IssueList } from '../components/IssueList.jsx'
import { useIssues } from '../hooks/useIssues.js'
import { ReportIssueModal } from '../components/ReportIssueModal.jsx'
import { CommentsModal } from '../components/CommentsModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const SORT_STORAGE_KEY = 'feed.sortKey'
const DEFAULT_SORT_KEY = 'newest'
const ALLOWED_SORT_KEYS = new Set(['newest', 'most-endorsed', 'hottest'])

export function FeedPage() {
  const [sortKey, setSortKey] = useState(() => {
    const storedSortKey = localStorage.getItem(SORT_STORAGE_KEY)
    return ALLOWED_SORT_KEYS.has(storedSortKey) ? storedSortKey : DEFAULT_SORT_KEY
  })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const { issues, loading, error, sortError, voteError, clearVoteError, reload, handleVote } =
    useIssues(sortKey, search)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [activeIssueForComments, setActiveIssueForComments] = useState(null)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortKey)
  }, [sortKey])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(String(searchInput ?? '').trim())
    }, 250)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    if (!voteError) return
    const timeoutId = window.setTimeout(() => {
      clearVoteError()
    }, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [voteError, clearVoteError])

  function handleReportIssue() {
    if (!isLoggedIn) {
      toast.error('Please log in to report an issue.')
      return
    }
    setIsReportOpen(true)
  }
  const handleCloseReport = () => setIsReportOpen(false)

  function handleVoteGated(issueKey, direction) {
    if (!isLoggedIn) {
      toast.error('Please log in to endorse issues.')
      return
    }
    handleVote(issueKey, direction)
  }

  function handleOpenComments(issue) {
    setActiveIssueForComments(issue)
  }

  function handleCloseComments() {
    setActiveIssueForComments(null)
  }

  return (
    <div className="app">
      <TopBar onReportIssue={handleReportIssue} />

      <main className="container page">
        <section className="hero" aria-label="Welcome">
          <div className="hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Düsseldorf Civic Engagement
          </div>

          <h1 className="hero__headline">
            Building a <span className="hero__headline-accent">Better City,</span> Together.
          </h1>

          <p className="hero__subtitle">
            Your direct line to City Hall. Report maintenance needs, propose local improvements, and endorse the issues that matter most to your neighborhood.
          </p>

          <div className="hero__actions">
            <button type="button" className="hero__primary-btn" onClick={handleReportIssue}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              File a New Report
            </button>
            <button type="button" className="hero__secondary-btn" disabled aria-disabled="true">
              View Interactive Map
            </button>
          </div>
        </section>

        <section className="feed-panel" aria-label="Feed header and filters">
          <div className="feed-panel__header">
            <div className="feed-panel__header-left">
              <h2 className="feed-panel__title">Active Issues Feed</h2>
              {!loading && !error && (
                <span className="feed-panel__count">{issues.length} local reports</span>
              )}
            </div>
            <div className="feed-panel__header-right">
              <input
                type="search"
                className="feed-panel__search-input"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <SortChips value={sortKey} onChange={setSortKey} />
            </div>
          </div>
          {sortError && (
            <p className="sort-error" role="status">
              {sortError}
            </p>
          )}
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
            <IssueList
              issues={issues}
              onVote={handleVoteGated}
              onOpenComments={handleOpenComments}
            />
          )}
        </section>
      </main>
      {voteError && (
        <div className="toast toast--error" role="status" aria-live="polite">
          {voteError}
        </div>
      )}
      <ReportIssueModal open={isReportOpen} onClose={handleCloseReport} onSubmitted={reload} />
      <CommentsModal
        isOpen={Boolean(activeIssueForComments)}
        issue={activeIssueForComments}
        onClose={handleCloseComments}
      />
    </div>
  )
}
