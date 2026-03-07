import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/');
        } catch (err) {
            // error is set by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup" id="signup-page">
            <div className="signup__bg">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
            </div>

            <div className="signup__card glass-heavy">
                <div className="signup__logo">
                    <img src="/images/logo.png" alt="AnimeWorldFun" className="signup__logo-img" />
                </div>
                <h1 className="signup__title">Join the World</h1>
                <p className="signup__subtitle">Create your otaku account</p>

                {error && (
                    <div className="signup__error" id="signup-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signup__form" id="signup-form">
                    <div className="input-group">
                        <label htmlFor="signup-name">Name</label>
                        <input
                            type="text"
                            id="signup-name"
                            className="input-field"
                            placeholder="Your Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            minLength={2}
                            maxLength={50}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            type="email"
                            id="signup-email"
                            className="input-field"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="signup-password">Password</label>
                        <input
                            type="password"
                            id="signup-password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="signup-confirm">Confirm Password</label>
                        <input
                            type="password"
                            id="signup-confirm"
                            className="input-field"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg signup__btn" disabled={loading} id="signup-submit-btn">
                        {loading ? (
                            <span className="signup__spinner"></span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="signup__note">
                    Already have an account? <Link to="/login" className="signup__link">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
