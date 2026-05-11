import { Link } from 'react-router-dom';

function SignIn() {
    return (
        <div className="auth">
            <div className="auth__wrap">
                <div className="auth__card">

                    <div className="auth__brand">
                        <div className="nav__logo">S</div>
                        <span className="nav__title">SMOverflow</span>
                    </div>

                    <h1 className="auth__title">Welcome back</h1>
                    <p className="auth__subtitle">Sign in to continue to your account</p>

                    <form className="auth__form" onSubmit={(e) => e.preventDefault()}>
                        <input
                            className="input"
                            type="email"
                            autoComplete="email"
                            placeholder="Email address"
                        />
                        <input
                            className="input"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Password"
                        />

                        <div className="auth__row">
                            <label className="check">
                                <input type="checkbox" />
                                Remember me
                            </label>
                            <a href="#" className="auth__link">Forgot password?</a>
                        </div>

                        <button type="submit" className="auth__submit">
                            Sign in
                        </button>
                    </form>

                    <div className="auth__divider">
                        <span className="auth__divider-line" />
                        <span className="auth__divider-text">OR CONTINUE WITH</span>
                        <span className="auth__divider-line" />
                    </div>

                    <div className="oauth-grid">
                        <button type="button" className="oauth-btn">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.2-4.9 3.2-8.3z" />
                                <path fill="#34A853" d="M12 23c3 0 5.6-1 7.4-2.7l-3.7-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2v2.9C3.8 20.4 7.6 23 12 23z" />
                                <path fill="#FBBC05" d="M5.8 13.9c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.6H2c-.8 1.6-1.2 3.4-1.2 5.4s.5 3.8 1.2 5.4l3.8-3z" />
                                <path fill="#EA4335" d="M12 5c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.6 1.8 15 1 12 1 7.6 1 3.8 3.6 2 7.4l3.8 3C6.7 7 9.1 5 12 5z" />
                            </svg>
                            Google
                        </button>
                        <button type="button" className="oauth-btn">
                            <svg viewBox="0 0 24 24" fill="#1d1d1f" aria-hidden="true">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Apple
                        </button>
                    </div>
                </div>

                <p className="auth__foot">
                    New to SMOverflow? <Link to="/signup">Create an account</Link>
                </p>
            </div>
        </div>
    );
}

export default SignIn;
