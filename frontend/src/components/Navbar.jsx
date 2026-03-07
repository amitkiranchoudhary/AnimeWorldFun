import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (isAdmin) return '/admin';
        if (isWriter) return '/writer';
        return '/';
    };

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
            <div className="navbar__inner container">
                <Link to="/" className="navbar__logo" id="nav-logo">
                    <img src="/images/logo.png" alt="AnimeWorldFun" className="navbar__logo-img" />
                </Link>

                <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
                    <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
                    <Link to="/blogs" className={`navbar__link ${location.pathname === '/blogs' ? 'active' : ''}`}>Blogs</Link>
                    <Link to="/anime-tracker" className={`navbar__link ${location.pathname === '/anime-tracker' ? 'active' : ''}`}>Tracker</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to={getDashboardPath()} className="navbar__link navbar__link--dashboard">
                                {isAdmin ? '⚡ Admin' : '✏️ Writer'}
                            </Link>
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
