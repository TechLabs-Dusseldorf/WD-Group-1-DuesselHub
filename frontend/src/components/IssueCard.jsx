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
  if (value.includes('progress')) return { label: 'In progress', tone: 'progress' }
  if (value.includes('resolved') || value.includes('fixed')) return { label: 'Fixed', tone: 'fixed' }
  return { label: 'Open', tone: 'open' }
})()

return (
  <>
    <article
      className={`issue-card issue-card--clickable ${onDelete ? 'issue-card--with-actions' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleOpenComments}
      onKeyDown={onCardKeyDown}
      aria-label={`Open comments for issue: ${issue.title}`}
    >
      {/* ... rest of your existing JSX stays unchanged ... */}
      <div className="issue-card__vote">
        <div className="issue-card__voteMain">
          <button
            type="button"
            className={`vote__button ${issue.myVote === 1 ? 'vote__button--active' : ''}`}
            onClick={handleUpvote}
            aria-label={`Endorse issue: ${issue.title}`}
          >
            ▲
          </button>
          <span className="vote__hint">Endorse</span>

          <span className="vote__count" aria-label="Votes">
            {endorsements}
          </span>
        </div>
      </div>

      <div className="issue-card__main">
        <div className="issue-card__titleRow">
          <div className="issue-card__titleGroup">
            <h3 className="issue-card__title" title={issue.title}>
              {issue.title}
            </h3>
            {normalizedStatus && (
              <span className={`issue-card__status issue-card__status--${normalizedStatus.tone}`}>
                {normalizedStatus.label}
              </span>
            )}
          </div>
        </div>

        <div className="issue-card__meta">
          <span className="issue-card__location" title={issue.location}>
            {issue.location}
          </span>

          <span className="issue-card__dot" aria-hidden="true">
            ·
          </span>

          {createdAt ? (
            <time className="issue-card__date" dateTime={createdAt}>
              {formatDate(createdAt)}
            </time>
          ) : (
            <span className="issue-card__date" aria-label="Date">
              —
            </span>
          )}
        </div>

        <p className="issue-card__description" title={issue.description}>
          {issue.description}
        </p>

      <div className="issue-card__actions">
        <button
          type="button"
          className="btn issue-card__commentsBtn issue-card__commentsBtn--stack"
          onClick={handleOpenComments}
          aria-label={`Open comments for issue: ${issue.title}`}
        >
          {typeof commentCount === 'number' ? `Comments: ${commentCount}` : 'Comments'}
        </button>

        {onDelete && (
          <button
            type="button"
            className="btn btn--secondary issue-card__deleteBtn"
            onClick={handleDelete}
            aria-label={`Delete issue: ${issue.title}`}
          >
            Delete
          </button>
        )}
      </div>   

      </div>

      <div className="issue-card__side">
        <div
          className={`issue-card__photo ${hasPhoto ? 'issue-card__photo--clickable' : ''}`}
          role={hasPhoto ? 'button' : undefined}
          tabIndex={hasPhoto ? 0 : undefined}
          title={hasPhoto ? 'Click to view details' : undefined}
          aria-label={hasPhoto ? `Open details image for issue: ${issue.title}` : undefined}
          onClick={(event) => {
            if (!hasPhoto) return
            event.stopPropagation()
            openDetails()
          }}
          onKeyDown={(event) => {
            if (!hasPhoto) return
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            event.stopPropagation()
            openDetails()
          }}
        >
          <img
            className="issue-card__photoImg"
            src={photoSrc}
            alt={photoUrl ? `Photo for: ${issue.title}` : 'No photo provided'}
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      </div>
      </article>
      <IssueDetailsFlyout isOpen={isFlyoutOpen} issue={issue} onClose={closeDetails} />
    </>
  )
}
