import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, commentAPI } from '../utils/api';
import './BlogPost.css';

export default function BlogPost() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentForm, setCommentForm] = useState({ visitorName: '', visitorEmail: '', content: '' });
    const [submitStatus, setSubmitStatus] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await blogAPI.getBlogBySlug(slug);
                setBlog(res.data.blog);
                const commentsRes = await commentAPI.getBlogComments(res.data.blog._id);
                setComments(commentsRes.data.comments);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitStatus('sending');
            await commentAPI.submitComment({
                blogId: blog._id,
                ...commentForm
            });
            setSubmitStatus('success');
            setCommentForm({ visitorName: '', visitorEmail: '', content: '' });
        } catch (err) {
            setSubmitStatus('error');
        }
    };

    if (loading) {
        return (
            <div className="blogpost" id="blogpost-page">
                <div className="container">
                    <div className="blogpost__loading">
                        <div className="skeleton" style={{ width: '100px', height: '22px', marginBottom: '1rem' }}></div>
                        <div className="skeleton" style={{ width: '80%', height: '48px', marginBottom: '1.5rem' }}></div>
                        <div className="skeleton" style={{ width: '100%', height: '300px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blogpost" id="blogpost-page">
                <div className="container">
                    <div className="blogpost__not-found">
                        <h2>Blog not found</h2>
                        <Link to="/blogs" className="btn btn-primary">Back to Blogs</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blogpost" id="blogpost-page">
            {/* Header */}
            <div className="blogpost__header">
                <div className="container">
                    <Link to="/blogs" className="blogpost__back">← Back to Blogs</Link>
                    <div className="blogpost__meta-top">
                        <span className="badge badge-purple">{blog.category}</span>
                        <span className="blogpost__date">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="blogpost__views">👁 {blog.views} views</span>
                    </div>
                    <h1 className="blogpost__title">{blog.title}</h1>
                    <div className="blogpost__author-bar">
                        <div className="blogpost__author-avatar">{blog.author?.name?.[0] || '?'}</div>
                        <div>
                            <span className="blogpost__author-name">{blog.author?.name}</span>
                            <span className="blogpost__read-time">{blog.readTime} min read</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {blog.coverImage && (
                <div className="blogpost__cover">
                    <img src={blog.coverImage} alt={blog.title} />
                </div>
            )}

            {/* Content */}
            <div className="container">
                <article className="blogpost__content" dangerouslySetInnerHTML={{ __html: blog.content }} />

                {/* Tags */}
                {blog.tags?.length > 0 && (
                    <div className="blogpost__tags">
                        {blog.tags.map(tag => (
                            <Link key={tag} to={`/blogs?tag=${tag}`} className="blogpost__tag">#{tag}</Link>
                        ))}
                    </div>
                )}

                {/* Comments Section */}
                <section className="blogpost__comments" id="comments-section">
                    <h3 className="blogpost__comments-title">
                        Comments ({comments.length})
                    </h3>

                    {comments.length > 0 ? (
                        <div className="blogpost__comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-card glass">
                                    <div className="comment-card__header">
                                        <div className="comment-card__avatar">{comment.visitorName[0]}</div>
                                        <div>
                                            <span className="comment-card__name">{comment.visitorName}</span>
                                            <span className="comment-card__date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="comment-card__content">{comment.content}</p>
                                    {comment.adminReply && (
                                        <div className="comment-card__reply">
                                            <span className="comment-card__reply-label">↳ Reply from team</span>
                                            <p>{comment.adminReply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="blogpost__no-comments">No comments yet. Be the first!</p>
                    )}

                    {/* Comment Form */}
                    <form className="blogpost__comment-form glass" onSubmit={handleCommentSubmit} id="comment-form">
                        <h4>Leave a Comment</h4>
                        <div className="blogpost__form-row">
                            <div className="input-group">
                                <label htmlFor="comment-name">Name</label>
                                <input
                                    type="text"
                                    id="comment-name"
                                    className="input-field"
                                    placeholder="Your name"
                                    value={commentForm.visitorName}
                                    onChange={e => setCommentForm({ ...commentForm, visitorName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="comment-email">Email</label>
                                <input
                                    type="email"
                                    id="comment-email"
                                    className="input-field"
                                    placeholder="Your email"
                                    value={commentForm.visitorEmail}
                                    onChange={e => setCommentForm({ ...commentForm, visitorEmail: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="comment-content">Comment</label>
                            <textarea
                                id="comment-content"
                                className="input-field"
                                placeholder="Write your thoughts..."
                                value={commentForm.content}
                                onChange={e => setCommentForm({ ...commentForm, content: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitStatus === 'sending'}>
                            {submitStatus === 'sending' ? 'Sending...' : 'Submit Comment'}
                        </button>
                        {submitStatus === 'success' && (
                            <p className="blogpost__submit-msg success">✅ Comment submitted! It will appear after review.</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className="blogpost__submit-msg error">❌ Failed to submit. Please try again.</p>
                        )}
                    </form>
                </section>
            </div>
        </div>
    );
}
