import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'

export function TopBar({ onReportIssue }) {
    const { isLoggedIn, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const isAuthPage =
        location.pathname === '/login' || location.pathname === '/register'

    function handleLogout() {
        logout()
        toast.info('Logged out.')
        navigate('/login')
    }

    function handleReportClick() {
        if (!isLoggedIn) {
            toast.error('Please log in to report an issue.')
            return
        }
        onReportIssue?.()
    }

    const isExplorePage = location.pathname === '/'

    return (
        <header className="topbar">
            <div className="container topbar__inner">
                <div className="topbar__left">
                    <a className="topbar__wordmark" href="/" aria-label="Go to home page">
                        DüsselHub
                    </a>

                    {!isAuthPage && (
                        <nav className="topbar__nav" aria-label="Main navigation">
                            <a
                                className={`topbar__nav-link${isExplorePage ? ' topbar__nav-link--active' : ''}`}
                                href="/"
                            >
                                Explore
                            </a>

                            <span className="topbar__nav-link topbar__nav-link--disabled" aria-disabled="true">
                                Map
                                <span className="topbar__soon-badge">Soon</span>
                            </span>
                        </nav>
                    )}
                </div>

                <div className="topbar__actions">
                    {!isAuthPage && (
                        isLoggedIn ? (
                            <>
                                <button
                                    type="button"
                                    className="topbar__text-btn"
                                    onClick={() => navigate('/profile')}
                                >
                                    Profile
                                </button>
                                <button
                                    type="button"
                                    className="topbar__text-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="topbar__text-btn"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        className="topbar__report-btn"
                        onClick={handleReportClick}
                    >
                        Report Issue
                    </button>
                </div>
            </div>
            <div className="topbar__divider" aria-hidden="true" />
        </header>
    )
}
