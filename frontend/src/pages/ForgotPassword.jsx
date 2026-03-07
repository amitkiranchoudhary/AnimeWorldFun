import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authAPI.forgotPassword(email);
            setSuccess('If that email is registered, an OTP has been sent. Check your email or server console.');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await authAPI.verifyOTP(email, otp);
            setSuccess('OTP verified! Set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(email, otp, newPassword);
            setSuccess('Password reset successfully! You can now log in.');
            setStep(4); // done
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const EyeOpen = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    const EyeClosed = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    return (
        <div className="forgot" id="forgot-password-page">
            <div className="forgot__bg">
                <div className="hero__orb hero__orb--1"></div>
                <div className="hero__orb hero__orb--2"></div>
            </div>

            <div className="forgot__card glass-heavy">
                <div className="forgot__logo">
                    <img src="/images/logo.png" alt="AnimeWorldFun" className="forgot__logo-img" />
                </div>
                <h1 className="forgot__title">Reset Password</h1>

                {/* Progress steps */}
                <div className="forgot__steps">
                    <div className={`forgot__step ${step >= 1 ? 'forgot__step--active' : ''}`}>
                        <span className="forgot__step-num">1</span>
                        <span className="forgot__step-label">Email</span>
                    </div>
                    <div className="forgot__step-line"></div>
                    <div className={`forgot__step ${step >= 2 ? 'forgot__step--active' : ''}`}>
                        <span className="forgot__step-num">2</span>
                        <span className="forgot__step-label">OTP</span>
                    </div>
                    <div className="forgot__step-line"></div>
                    <div className={`forgot__step ${step >= 3 ? 'forgot__step--active' : ''}`}>
                        <span className="forgot__step-num">3</span>
                        <span className="forgot__step-label">Password</span>
                    </div>
                </div>

                {error && <div className="forgot__error">⚠️ {error}</div>}
                {success && <div className="forgot__success">✅ {success}</div>}

                {/* Step 1: Enter email */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="forgot__form">
                        <p className="forgot__desc">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
                        <div className="input-group">
                            <label htmlFor="forgot-email">Email</label>
                            <input
                                type="email"
                                id="forgot-email"
                                className="input-field"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg forgot__btn" disabled={loading}>
                            {loading ? <span className="forgot__spinner"></span> : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="forgot__form">
                        <p className="forgot__desc">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
                        <div className="input-group">
                            <label htmlFor="forgot-otp">OTP Code</label>
                            <input
                                type="text"
                                id="forgot-otp"
                                className="input-field forgot__otp-input"
                                placeholder="000000"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                maxLength={6}
                                autoComplete="one-time-code"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg forgot__btn" disabled={loading || otp.length < 6}>
                            {loading ? <span className="forgot__spinner"></span> : 'Verify OTP'}
                        </button>
                        <button type="button" className="btn btn-secondary forgot__resend" onClick={() => { setStep(1); setError(null); setSuccess(null); }}>
                            ← Back to email
                        </button>
                    </form>
                )}

                {/* Step 3: New password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="forgot__form">
                        <p className="forgot__desc">Create a new password for your account.</p>
                        <div className="input-group">
                            <label htmlFor="forgot-new-pw">New Password</label>
                            <div className="input-password-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="forgot-new-pw"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                                </button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="forgot-confirm-pw">Confirm Password</label>
                            <input
                                type="password"
                                id="forgot-confirm-pw"
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg forgot__btn" disabled={loading}>
                            {loading ? <span className="forgot__spinner"></span> : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Step 4: Done */}
                {step === 4 && (
                    <div className="forgot__done">
                        <span className="forgot__done-icon">🎉</span>
                        <p>Your password has been reset successfully!</p>
                        <Link to="/login" className="btn btn-primary btn-lg">Go to Login</Link>
                    </div>
                )}

                {step < 4 && (
                    <p className="forgot__back">
                        Remember your password? <Link to="/login" className="forgot__link">Sign In</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
