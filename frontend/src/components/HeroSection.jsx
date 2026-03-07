import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useMouseParallax from '../hooks/useMouseParallax';
import { fireConfetti } from '../utils/confetti';
import './HeroSection.css';

export default function HeroSection() {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const parallaxRef = useRef(null);
    const [countsVisible, setCountsVisible] = useState(false);

    useMouseParallax(parallaxRef);

    useEffect(() => {
        const hero = heroRef.current;
        const handleScroll = () => {
            if (!hero) return;
            const scrollY = window.scrollY;
            const opacity = Math.max(0, 1 - scrollY / 600);
            const translateY = scrollY * 0.4;
            hero.style.opacity = opacity;
            hero.style.transform = `translateY(${translateY}px)`;
        };
        window.addEventListener('scroll', handleScroll);

        // Entrance animation
        const title = titleRef.current;
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(40px)';
            setTimeout(() => {
                title.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 200);
        }

        // Count-up trigger
        const timer = setTimeout(() => setCountsVisible(true), 800);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    return (
        <section className="hero" id="hero-section" ref={parallaxRef}>
            {/* Animated background elements */}
            <div className="hero__bg">
                <div className="hero__orb hero__orb--1" data-parallax-speed="2"></div>
                <div className="hero__orb hero__orb--2" data-parallax-speed="3"></div>
                <div className="hero__orb hero__orb--3" data-parallax-speed="1.5"></div>
                <div className="hero__particles">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="hero__particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}></div>
                    ))}
                </div>
            </div>

            <div className="hero__content container" ref={heroRef}>
                <div className="hero__text" ref={titleRef}>
                    <div className="hero__badge">
                        <span className="hero__badge-dot"></span>
                        300+ Anime Watched &amp; Counting
                    </div>

                    <h1 className="hero__title">
                        <span className="hero__title-line">Welcome to</span>
                    </h1>

                    {/* Hero landing image replacing "AnimeWorldFun" text */}
                    <div className="hero__landing-image-wrap">
                        <img
                            src="/images/hero-landing.png"
                            alt="AnimeWorldFun - World of Anime Heroes"
                            className="hero__landing-image"
                        />
                    </div>

                    <p className="hero__subtitle">
                        Your ultimate destination for anime blogs, reviews, top lists, and tracking
                        your watchlist. Dive into a world crafted by a true otaku.
                    </p>

                    <div className="hero__actions">
                        <Link to="/blogs" className="btn btn-anime btn-anime--explore btn-lg" id="hero-explore-btn" onClick={fireConfetti}>
                            {/* Compass Icon - shakes on hover */}
                            <img src="/images/compass.png" alt="" className="btn-anime__icon btn-anime__icon--compass" width="30" height="30" />
                            Explore Blogs
                        </Link>
                        <Link to="/anime-tracker" className="btn btn-anime btn-anime--track btn-lg" id="hero-tracker-btn" onClick={fireConfetti}>
                            {/* Sharingan Eye */}
                            <svg className="btn-anime__icon btn-anime__icon--sharingan" width="28" height="28" viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="28" fill="#c0392b" />
                                <circle cx="32" cy="32" r="18" fill="none" stroke="#1a1a2e" strokeWidth="2" />
                                <circle cx="32" cy="32" r="8" fill="#1a1a2e" />
                                <circle cx="32" cy="14" r="4" fill="#1a1a2e" />
                                <circle cx="16.7" cy="41" r="4" fill="#1a1a2e" />
                                <circle cx="47.3" cy="41" r="4" fill="#1a1a2e" />
                            </svg>
                            Track Anime
                        </Link>
                    </div>
                </div>

                {/* Owner's Achievements Stats */}
                <div className="hero__stats-section">
                    <span className="hero__stats-label">Owner's Achievements</span>
                    <div className="hero__stats">
                        <div className="hero__stat">
                            <span className={`hero__stat-number ${countsVisible ? 'hero__stat-number--visible' : ''}`}>300+</span>
                            <span className="hero__stat-label">Anime Watched</span>
                        </div>
                        <div className="hero__stat-divider"></div>
                        <div className="hero__stat">
                            <span className={`hero__stat-number ${countsVisible ? 'hero__stat-number--visible' : ''}`}>∞</span>
                            <span className="hero__stat-label">Stories to Tell</span>
                        </div>
                        <div className="hero__stat-divider"></div>
                        <div className="hero__stat">
                            <span className={`hero__stat-number ${countsVisible ? 'hero__stat-number--visible' : ''}`}>
                                98%
                                <span className="hero__stat-arrow">↑</span>
                            </span>
                            <span className="hero__stat-label">Otaku Spirit & Still Going</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrolling ticker */}
            <div className="hero__ticker">
                <div className="hero__ticker-track">
                    <span>NARUTO ✦ ONE PIECE ✦ ATTACK ON TITAN ✦ JUJUTSU KAISEN ✦ DEMON SLAYER ✦ DEATH NOTE ✦ FULLMETAL ALCHEMIST ✦ HUNTER X HUNTER ✦ MY HERO ACADEMIA ✦ STEINS;GATE ✦ CODE GEASS ✦ </span>
                    <span>NARUTO ✦ ONE PIECE ✦ ATTACK ON TITAN ✦ JUJUTSU KAISEN ✦ DEMON SLAYER ✦ DEATH NOTE ✦ FULLMETAL ALCHEMIST ✦ HUNTER X HUNTER ✦ MY HERO ACADEMIA ✦ STEINS;GATE ✦ CODE GEASS ✦ </span>
                </div>
            </div>
        </section>
    );
}
