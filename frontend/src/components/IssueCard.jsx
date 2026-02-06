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

export function IssueCard({ issue, onVote }) {
  const placeholderSrc = '/issue-image-placeholder.svg'
  const photoUrl = issue?.photoUrl ?? ''
  const photoSrc = photoUrl ? photoUrl : placeholderSrc

  const endorsements = typeof issue.endorsements === 'number' ? issue.endorsements : 0
  const createdAt = issue.createdAt || null

  const handleUpvote = () => {
    if (!onVote) return
    onVote(issue.issueKey, 1)
  }

  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(placeholderSrc)) return
    e.currentTarget.src = placeholderSrc
  }

  return (
    <article className="issue-card">
      <div className="issue-card__vote">
        <button
          type="button"
          className={`vote__button ${issue.myVote === 1 ? 'vote__button--active' : ''}`}
          onClick={handleUpvote}
          aria-label={`Upvote issue: ${issue.title}`}
        >
          ▲
        </button>

        <span className="vote__count" aria-label="Votes">
          {endorsements}
        </span>
      </div>

      <div className="issue-card__main">
        <h3 className="issue-card__title" title={issue.title}>
          {issue.title}
        </h3>

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
      </div>

      <div className="issue-card__photo">
        <img
          className="issue-card__photoImg"
          src={photoSrc}
          alt={photoUrl ? `Photo for: ${issue.title}` : 'No photo provided'}
          loading="lazy"
          onError={handleImageError}
        />
      </div>
    </article>
  )
}
