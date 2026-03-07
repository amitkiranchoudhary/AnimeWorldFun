import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fireConfetti, fireFireworks } from '../utils/confetti';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await login(email, password);
            fireFireworks();
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'writer') navigate('/writer');
            else navigate('/');
        } catch (err) {
            // error is set by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" id="login-page">
            <div className="auth-page__bg">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
            </div>

            <div className="auth-card glass-heavy">
                {/* Left panel - decorative */}
                <div className="auth-card__side">
                    <div className="auth-card__art">
                        <div className="auth-card__kanji">ログイン</div>
                        <p className="auth-card__tagline">Welcome back, Nakama!</p>
                        <div className="auth-card__deco">
                            <span>⚔️</span>
                            <span>🐉</span>
                            <span>🌸</span>
                        </div>
                    </div>
                </div>

                {/* Right panel - form */}
                <div className="auth-card__main">
                    <div className="auth-card__logo">
                        <img src="/images/logo.png" alt="AnimeWorldFun" className="auth-card__logo-img" />
                    </div>
                    <h1 className="auth-card__title">Welcome Back</h1>
                    <p className="auth-card__subtitle">Sign in to your account</p>

                    {/* Social login buttons */}
                    <div className="auth-social">
                        <button className="auth-social__btn auth-social__btn--google" onClick={(e) => fireConfetti(e)}>
                            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>
                        <button className="auth-social__btn auth-social__btn--apple" onClick={(e) => fireConfetti(e)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                            Continue with Apple
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>or sign in with email</span>
                    </div>

                    {error && (
                        <div className="auth-error" id="login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form" id="login-form">
                        <div className="input-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                type="email"
                                id="login-email"
                                className="input-field"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="login-password">Password</label>
                            <div className="input-password-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="login-password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading} id="login-submit-btn" onClick={fireConfetti}>
                            {loading ? (
                                <span className="login__spinner"></span>
                            ) : (
                                'Sign In ⚡'
                            )}
                        </button>
                    </form>

                    <div className="auth-links">
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                        <p className="auth-note">
                            Don't have an account? <Link to="/signup" className="auth-link auth-link--cta">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
