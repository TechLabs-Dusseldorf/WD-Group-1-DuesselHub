export function EmptyState({ onReload, onReport }) {
  return (
    <div className="state state--empty">
      <div className="state__title">No issues exist!</div>
      <p className="state__subtitle">There are no reports to show yet.</p>
      <div className="state__actions">
        <button type="button" className="btn" onClick={onReload}>
          Load again
        </button>
        <button type="button" className="btn btn--primary" onClick={onReport}>
          Report issue
        </button>
      </div>
    </div>
  )
}

