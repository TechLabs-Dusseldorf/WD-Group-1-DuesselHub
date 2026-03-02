import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'

export function TopBar({ onReportIssue }) {
    const logoUrl = '/duesselhub-logo.svg'
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

    return (
        <header className="topbar">
            <div className="container topbar__inner">
                <div className="topbar__left">
                    <a className="brand" href="/" aria-label="Go to home page">
                        <img
                            className="brand__logoImg"
                            src={logoUrl}
                            alt="DüsselHub"
                            width={140}
                            height={36}
                        />
                    </a>

                    {!isAuthPage && (
                        isLoggedIn ? (
                            <button
                                type="button"
                                className="btn btn--topbar btn--topbar-secondary"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn--topbar btn--topbar-secondary"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                        )
                    )}
                </div>

                <div className="topbar__actions">
                    <button
                        type="button"
                        className={`btn btn--topbar${!isLoggedIn ? ' btn--disabled' : ''}`}
                        disabled={!isLoggedIn}
                        onClick={isLoggedIn ? handleReportClick : undefined}
                    >
                        Report issue
                    </button>
                </div>
            </div>
        </header>
    )
}
