import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '../utils/api';
import { BlogCardSkeleton } from '../components/LoadingSkeleton';
import './BlogList.css';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page') || '1');
    const currentCategory = searchParams.get('category') || '';
    const currentSearch = searchParams.get('search') || '';

    const categories = ['General', 'Reviews', 'Top Lists', 'News', 'Guides', 'Analysis', 'Recommendations'];

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const params = { page: currentPage, limit: 12 };
                if (currentCategory) params.category = currentCategory;
                if (currentSearch) params.search = currentSearch;
                const res = await blogAPI.getBlogs(params);
                setBlogs(res.data.blogs);
                setPagination(res.data.pagination);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [currentPage, currentCategory, currentSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const q = form.get('search');
        setSearchParams(q ? { search: q } : {});
    };

    const handleCategoryFilter = (cat) => {
        if (cat === currentCategory) {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        searchParams.delete('page');
        setSearchParams(searchParams);
    };

    return (
        <div className="bloglist" id="bloglist-page">
            <div className="bloglist__header">
                <div className="container">
                    <span className="home__section-tag">Explore</span>
                    <h1 className="bloglist__title">
                        Anime <span className="gradient-text">Blogs</span>
                    </h1>
                    <p className="bloglist__subtitle">
                        Reviews, analysis, top lists, and more from the anime world
                    </p>

                    <form className="bloglist__search" onSubmit={handleSearch} id="blog-search-form">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bloglist__search-icon">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search blogs..."
                            className="bloglist__search-input"
                            defaultValue={currentSearch}
                            id="blog-search-input"
                        />
                        <button type="submit" className="btn btn-primary btn-sm" id="blog-search-btn">Search</button>
                    </form>

                    <div className="bloglist__categories">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`bloglist__cat-btn ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="bloglist__grid">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
                    ) : blogs.length > 0 ? (
                        blogs.map((blog, i) => (
                            <Link to={`/blogs/${blog.slug}`} key={blog._id} className="blog-card" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="blog-card__img-wrap">
                                    {blog.coverImage ? (
                                        <img src={blog.coverImage} alt={blog.title} className="blog-card__img" />
                                    ) : (
                                        <div className="blog-card__img-placeholder"><span>鬼</span></div>
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
                                        <span className="blog-card__read-time">{blog.readTime} min</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="home__empty" style={{ gridColumn: '1 / -1' }}>
                            <span className="home__empty-icon">🔍</span>
                            <p>{currentSearch ? `No blogs found for "${currentSearch}"` : 'No blogs yet. Check back soon!'}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bloglist__pagination">
                        {currentPage > 1 && (
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                searchParams.set('page', currentPage - 1);
                                setSearchParams(searchParams);
                            }}>← Prev</button>
                        )}
                        <span className="bloglist__page-info">Page {currentPage} of {pagination.pages}</span>
                        {currentPage < pagination.pages && (
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                searchParams.set('page', currentPage + 1);
                                setSearchParams(searchParams);
                            }}>Next →</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
