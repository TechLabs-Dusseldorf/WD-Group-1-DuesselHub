import { useEffect } from 'react'

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

function normalizeStatus(status) {
  const value = String(status ?? '').trim().toLowerCase()
  if (!value) return null
  if (value.includes('progress')) return { label: 'In progress', tone: 'progress' }
  if (value.includes('resolved') || value.includes('fixed')) return { label: 'Fixed', tone: 'fixed' }
  return { label: 'Open', tone: 'open' }
}

export function IssueDetailsFlyout({ isOpen, issue, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !issue) return null

  const status = normalizeStatus(issue.status)
  const photoUrl = issue?.photoUrl ?? ''
  const photoSrc = photoUrl || '/issue-image-placeholder.svg'
  const createdAt = issue?.createdAt ?? null

  const handleImageError = (event) => {
    const placeholder = '/issue-image-placeholder.svg'
    if (event.currentTarget.src.includes(placeholder)) return
    event.currentTarget.src = placeholder
  }

  return (
    <div className="modal issue-flyout" role="dialog" aria-modal="true" aria-label={`Issue details: ${issue.title}`}>
      <div className="modal__backdrop" onClick={onClose} />
      <section className="modal__dialog issue-flyout__dialog" role="document">
        <header className="issue-flyout__header">
          <div className="issue-flyout__titleRow">
            <h2 className="issue-flyout__title">{issue.title}</h2>
            {status && (
              <span className={`issue-card__status issue-card__status--${status.tone}`}>{status.label}</span>
            )}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close issue details">
            ×
          </button>
        </header>

        <div className="issue-flyout__meta">
          <span title={issue.location}>{issue.location || '—'}</span>
          <span aria-hidden="true">·</span>
          {createdAt ? <time dateTime={createdAt}>{formatDate(createdAt)}</time> : <span>—</span>}
        </div>

        <div className="issue-flyout__content">
          <p className="issue-flyout__description">{issue.description || 'No description provided.'}</p>
          <div className="issue-flyout__photoWrap">
            <img
              className="issue-flyout__photo"
              src={photoSrc}
              alt={photoUrl ? `Photo for: ${issue.title}` : 'No photo provided'}
              loading="lazy"
              onError={handleImageError}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
