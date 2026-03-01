export function TopBar({ onReportIssue }) {
    const logoUrl = '/duesselhub-logo.svg'

    return (
        <header className="topbar">
            <div className="container topbar__inner">
                <a className="brand" href="/" aria-label="Go to home page">
                    <img className="brand__logoImg" src={logoUrl} alt="DüsselHub" width={140} height={36} />
                </a>

                <div className="topbar__actions">
                    <button
                        type="button"
                        className="btn btn--topbar"
                        onClick={onReportIssue}
                    >
                        Report issue
                    </button>
                </div>
            </div>
        </header>
    )
}