import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function SignUp() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!agreed) {
            setError('You must agree to the Terms and Privacy Policy');
            return;
        }

        setIsLoading(true);
        const result = await signUp(username, email, password);
        setIsLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            navigate('/');
        }
    }

    return (
        <div className="auth">
            <div className="auth__wrap">
                <div className="auth__card">

                    <div className="auth__brand">
                        <div className="nav__logo">S</div>
                        <span className="nav__title">SMOverflow</span>
                    </div>

                    <h1 className="auth__title">Create account</h1>
                    <p className="auth__subtitle">Join the community in under a minute</p>

                    {error && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(215, 0, 21, 0.1)',
                            border: '1px solid rgba(215, 0, 21, 0.3)',
                            color: '#d70015',
                            fontSize: '13px',
                            marginBottom: '16px',
                        }}>
                            {error}
                        </div>
                    )}

                    <form className="auth__form" onSubmit={handleSubmit}>
                        <input
                            className="input"
                            type="text"
                            autoComplete="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            className="input"
                            type="email"
                            autoComplete="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            className="input"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            className="input"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <label className="terms">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span>
                                I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                            </span>
                        </label>

                        <button type="submit" className="auth__submit" disabled={isLoading}>
                            {isLoading ? 'Creating account…' : 'Create account'}
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
                    Already have an account? <Link to="/signin">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
