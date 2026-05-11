import { Link } from 'react-router-dom';

export default function NavBar() {
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

                    <Link to="/signin" className="nav__signin">
                        Sign in
                    </Link>

                    <button className="btn btn-primary btn-sm">
                        Ask a question
                    </button>
                </div>
            </div>
        </header>
    );
}
