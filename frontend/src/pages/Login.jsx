import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await login(email, password);
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
        <div className="login" id="login-page">
            <div className="login__bg">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
            </div>

            <div className="login__card glass-heavy">
                <div className="login__logo">
                    <img src="/images/logo.png" alt="AnimeWorldFun" className="login__logo-img" />
                </div>
                <h1 className="login__title">Welcome Back</h1>
                <p className="login__subtitle">Sign in to your account</p>

                {error && (
                    <div className="login__error" id="login-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login__form" id="login-form">
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
                        <input
                            type="password"
                            id="login-password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg login__btn" disabled={loading} id="login-submit-btn">
                        {loading ? (
                            <span className="login__spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="login__note">
                    Don't have an account? <Link to="/signup" className="login__link">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
