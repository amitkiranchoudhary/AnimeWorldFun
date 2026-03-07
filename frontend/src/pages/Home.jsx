import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../hooks/useScrollReveal';
import HeroSection from '../components/HeroSection';
import { BlogCardSkeleton } from '../components/LoadingSkeleton';
import { blogAPI, animeAPI } from '../utils/api';
import './Home.css';

export default function Home() {
    const [blogs, setBlogs] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useScrollReveal();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [blogRes, animeRes] = await Promise.allSettled([
                    blogAPI.getBlogs({ limit: 6 }),
                    animeAPI.getTrending()
                ]);
                if (blogRes.status === 'fulfilled') setBlogs(blogRes.value.data.blogs);
                if (animeRes.status === 'fulfilled') setTrending(animeRes.value.data.anime.slice(0, 6));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="home" id="home-page">
            <HeroSection />

            {/* Featured Blogs Section */}
            <section className="home__section section" id="featured-blogs">
                <div className="container">
                    <div className="home__section-header scroll-reveal">
                        <span className="home__section-tag">Latest</span>
                        <h2 className="home__section-title">
                            Featured <span className="gradient-text">Blogs</span>
                        </h2>
                        <p className="home__section-desc">
                            Deep dives, reviews, and opinions from a seasoned anime watcher
                        </p>
                    </div>

                    <div className="home__blog-grid">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
                        ) : blogs.length > 0 ? (
                            blogs.map((blog, i) => (
                                <Link to={`/blogs/${blog.slug}`} key={blog._id} className="blog-card scroll-reveal" data-delay={`${i * 0.1}`}>
                                    <div className="blog-card__img-wrap">
                                        {blog.coverImage ? (
                                            <img src={blog.coverImage} alt={blog.title} className="blog-card__img" />
                                        ) : (
                                            <div className="blog-card__img-placeholder">
                                                <span>鬼</span>
                                            </div>
                                        )}
                                        <div className="blog-card__overlay"></div>
                                    </div>
                                    <div className="blog-card__body">
                                        <span className="badge badge-purple">{blog.category}</span>
                                        <h3 className="blog-card__title">{blog.title}</h3>
                                        <p className="blog-card__excerpt">{blog.excerpt}</p>
                                        <div className="blog-card__meta">
                                            <span className="blog-card__author">
                                                <div className="blog-card__avatar">{blog.author?.name?.[0] || '?'}</div>
                                                {blog.author?.name || 'Anonymous'}
                                            </span>
                                            <span className="blog-card__read-time">{blog.readTime} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="home__empty scroll-reveal">
                                <span className="home__empty-icon">📝</span>
                                <p>No blogs yet. The admin will start writing soon!</p>
                            </div>
                        )}
                    </div>

                    {blogs.length > 0 && (
                        <div className="home__section-cta scroll-reveal">
                            <Link to="/blogs" className="btn btn-secondary">View All Blogs →</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Trending Anime Section */}
            <section className="home__section home__anime-section section" id="trending-anime">
                <div className="container">
                    <div className="home__section-header scroll-reveal">
                        <span className="home__section-tag">Trending Now</span>
                        <h2 className="home__section-title">
                            Hot <span className="gradient-text">Anime</span> Right Now
                        </h2>
                        <p className="home__section-desc">
                            Currently airing anime that everyone's talking about
                        </p>
                    </div>

                    <div className="home__anime-grid">
                        {trending.map((anime, i) => (
                            <div key={anime.malId} className="anime-mini-card scroll-reveal-scale" data-delay={`${i * 0.1}`}>
                                <div className="anime-mini-card__img-wrap">
                                    <img src={anime.imageUrl} alt={anime.title} className="anime-mini-card__img" />
                                    <div className="anime-mini-card__score">
                                        ★ {anime.score || 'N/A'}
                                    </div>
                                </div>
                                <div className="anime-mini-card__body">
                                    <h4 className="anime-mini-card__title">{anime.title}</h4>
                                    <div className="anime-mini-card__meta">
                                        <span className="badge badge-pink">{anime.type}</span>
                                        {anime.episodes > 0 && (
                                            <span className="anime-mini-card__eps">{anime.episodes} eps</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="home__section-cta scroll-reveal">
                        <Link to="/anime-tracker" className="btn btn-gold">
                            Start Tracking →
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="home__cta-section" id="cta-section">
                <div className="container">
                    <div className="home__cta glass scroll-reveal-scale">
                        <div className="home__cta-bg"></div>
                        <h2 className="home__cta-title">Ready to Dive Into the Anime World?</h2>
                        <p className="home__cta-text">
                            Track your favorite anime, read in-depth blogs, and join a community of otaku.
                        </p>
                        <div className="home__cta-actions">
                            <Link to="/blogs" className="btn btn-primary btn-lg">Start Reading</Link>
                            <Link to="/anime-tracker" className="btn btn-secondary btn-lg">Track Anime</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
