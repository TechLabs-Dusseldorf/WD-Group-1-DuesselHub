import { useState } from 'react'
import { IssueDetailsFlyout } from './IssueDetailsFlyout.jsx'

function formatDate(isoString) {
  if (!isoString) return '—'

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

function formatTimeAgo(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(isoString)
}

export function IssueCard({ issue, onVote, onOpenComments, onDelete }) {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const placeholderSrc = '/issue-image-placeholder.svg'
  const photoUrl = typeof issue?.photoUrl === 'string' ? issue.photoUrl.trim() : ''
  const hasPhoto = Boolean(photoUrl)
  const photoSrc = hasPhoto ? photoUrl : placeholderSrc

  const endorsements = typeof issue.endorsements === 'number' ? issue.endorsements : 0
  const commentCount =
    typeof issue?.commentCount === 'number'
      ? issue.commentCount
      : typeof issue?.commentsCount === 'number'
        ? issue.commentsCount
        : null
  const createdAt = issue.createdAt || null
  const status = String(issue?.status ?? '').trim()
  const timeAgo = formatTimeAgo(createdAt)

  const handleUpvote = (event) => {
    event.stopPropagation()
    if (!onVote) return
    onVote(issue.issueKey, 1)
  }

  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(placeholderSrc)) return
    e.currentTarget.src = placeholderSrc
  }

  const handleOpenComments = (event) => {
    event?.stopPropagation?.()
    if (!onOpenComments) return
    onOpenComments(issue)
  }

  const openDetails = () => setIsFlyoutOpen(true)
  const closeDetails = () => setIsFlyoutOpen(false)

  const onCardKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleOpenComments()
  }

  const handleDelete = (event) => {
    event?.stopPropagation?.()
    if (!onDelete) return
    onDelete(issue)
  }

  const normalizedStatus = (() => {
    const value = status?.toLowerCase()
    if (!value) return null
    if (value.includes('progress')) return { label: 'In Progress', tone: 'progress' }
    if (value.includes('resolved') || value.includes('fixed')) return { label: 'Fixed', tone: 'fixed' }
    return { label: 'Open', tone: 'open' }
  })()

  return (
    <>
      <article
        className="issue-card issue-card--clickable"
        role="button"
        tabIndex={0}
        onClick={handleOpenComments}
        onKeyDown={onCardKeyDown}
        aria-label={`Open comments for issue: ${issue.title}`}
      >
        {/* Image on the left */}
        <div
          className={`issue-card__photo-left ${hasPhoto ? 'issue-card__photo-left--clickable' : ''}`}
          onClick={(e) => {
            if (!hasPhoto) return
            e.stopPropagation()
            openDetails()
          }}
          onKeyDown={(e) => {
            if (!hasPhoto) return
            if (e.key !== 'Enter' && e.key !== ' ') return
            e.preventDefault()
            e.stopPropagation()
            openDetails()
          }}
          role={hasPhoto ? 'button' : undefined}
          tabIndex={hasPhoto ? 0 : undefined}
          aria-label={hasPhoto ? `View photo for: ${issue.title}` : undefined}
        >
          <img
            className="issue-card__photo-img"
            src={photoSrc}
            alt={photoUrl ? `Photo for: ${issue.title}` : 'No photo provided'}
            loading="lazy"
            onError={handleImageError}
          />
        </div>

        {/* Content body */}
        <div className="issue-card__body">
          {/* Top row: status badge + time ago */}
          <div className="issue-card__top">
            {normalizedStatus && (
              <span className={`issue-card__status issue-card__status--${normalizedStatus.tone}`}>
                {normalizedStatus.label}
              </span>
            )}
            {timeAgo && (
              <span className="issue-card__time">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Reported {timeAgo}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="issue-card__title" title={issue.title}>
            {issue.title}
          </h3>

          {/* Location */}
          {issue.location && (
            <div className="issue-card__location-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              <span className="issue-card__location" title={issue.location}>{issue.location}</span>
            </div>
          )}

          {/* Description */}
          <p className="issue-card__description" title={issue.description}>
            {issue.description}
          </p>

          {/* Divider */}
          <hr className="issue-card__divider" />

          {/* Footer */}
          <div className="issue-card__footer">
            <div className="issue-card__stats">
              <span className="issue-card__stat issue-card__stat--endorsements">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                {endorsements} Endorsements
              </span>
              <span className="issue-card__stat issue-card__stat--comments">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {typeof commentCount === 'number' ? `${commentCount} Comments` : 'Comments'}
              </span>
            </div>

            <div className="issue-card__footer-actions">
              <button
                type="button"
                className={`issue-card__endorse-btn ${issue.myVote === 1 ? 'issue-card__endorse-btn--active' : ''}`}
                onClick={handleUpvote}
                aria-label={`Endorse issue: ${issue.title}`}
              >
                Endorse Issue
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn issue-card__deleteBtn"
                  onClick={handleDelete}
                  aria-label={`Delete issue: ${issue.title}`}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
      <IssueDetailsFlyout isOpen={isFlyoutOpen} issue={issue} onClose={closeDetails} />
    </>
  )
}
