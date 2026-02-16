export function ErrorState({ message, onReload, onReport }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__title">We couldn’t load issues</div>
      <p className="state__subtitle">{message}</p>
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
