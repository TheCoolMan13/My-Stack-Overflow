import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NavBar() {
    const { user, isAuthenticated, signOut } = useAuth();

    return (
        <header className="nav">
            <div className="nav__inner">

                <Link to="/" className="nav__brand">
                    <div className="nav__logo">S</div>
                    <span className="nav__title">SMOverflow</span>
                </Link>

                <nav className="nav__links">
                    <Link to="/">Questions</Link>
                    <a href="#">Tags</a>
                    <a href="#">Users</a>
                    <a href="#">Companion</a>
                </nav>

                <div className="nav__right">
                    <div className="nav__badge">
                        <span className="nav__badge-dot" />
                        <span>llama-3.1-8b</span>
                    </div>

                    {isAuthenticated && user ? (
                        <>
                            <Link to="/ask" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                                Ask a question
                            </Link>
                            <div className="user-menu">
                                <div className="user-menu__avatar">{user.avatarInitial}</div>
                                <div className="user-menu__info">
                                    <span className="user-menu__name">{user.username}</span>
                                    <span className="user-menu__rep">{user.reputation.toLocaleString()} rep</span>
                                </div>
                                <button
                                    className="user-menu__signout"
                                    aria-label="Sign out"
                                    onClick={signOut}
                                    title="Sign out"
                                >
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 4h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M8 10h8M13 6l2 4-2 4" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="nav__signin">
                                Sign in
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
