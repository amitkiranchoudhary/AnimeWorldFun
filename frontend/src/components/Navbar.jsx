import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fireConfetti } from '../utils/confetti';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, isAdmin, isWriter, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const handleLogout = (e) => {
        fireConfetti(e);
        logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (isAdmin) return '/admin';
        if (isWriter) return '/writer';
        return '/';
    };

    const navItems = [
        { path: '/', label: 'Home', emoji: '🏠' },
        { path: '/blogs', label: 'Blogs', emoji: '📚' },
        { path: '/anime-tracker', label: 'Tracker', emoji: '🎯' },
    ];

    // Find active index for pill indicator
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
            <div className="navbar__inner container">
                <Link to="/" className="navbar__logo" id="nav-logo">
                    <img src="/images/logo.png" alt="AnimeWorldFun" className="navbar__logo-img" />
                </Link>

                <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
                    {/* Glassmorphic pill nav */}
                    <div className="navbar__pill-nav">
                        <div className="navbar__pill-glass">
                            <div className="navbar__pill-glass-inner" />
                        </div>
                        <div className="navbar__pill-items">
                            {navItems.map((item, i) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`navbar__pill-item ${location.pathname === item.path ? 'navbar__pill-item--active' : ''}`}
                                >
                                    <span className="navbar__pill-emoji">{item.emoji}</span>
                                    {item.label}
                                </Link>
                            ))}
                            {/* Sliding indicator ball */}
                            {activeIndex >= 0 && (
                                <div
                                    className="navbar__pill-indicator"
                                    style={{ '--pill-index': activeIndex, '--pill-count': navItems.length }}
                                />
                            )}
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <>
                            <Link to={getDashboardPath()} className="navbar__link navbar__link--dashboard">
                                {isAdmin ? '⚡ Admin' : isWriter ? '✏️ Writer' : '🏠 Dashboard'}
                            </Link>

                            {/* User info with loyalty badge */}
                            <div className="navbar__user-info">
                                {user?.loyaltyBadge && (
                                    <span className="navbar__badge" title={`${user.loyaltyBadge.tier} — ${user.loyaltyBadge.label}`}>
                                        {user.loyaltyBadge.emoji} {user.loyaltyBadge.tier}
                                    </span>
                                )}
                                <span className="navbar__username">{user?.name}</span>
                            </div>

                            <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="nav-logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="navbar__auth-actions">
                            <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm" id="nav-signup-btn">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    id="nav-burger"
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
