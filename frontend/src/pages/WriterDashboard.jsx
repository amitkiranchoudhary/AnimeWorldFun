import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogAPI, commentAPI } from '../utils/api';
import './Dashboard.css';

export default function WriterDashboard() {
    const { user, isWriter, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('my-blogs');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Blog form
    const [blogForm, setBlogForm] = useState({ title: '', content: '', category: 'General', tags: '', status: 'draft', coverImage: '' });
    const [editingBlog, setEditingBlog] = useState(null);
    const [blogMsg, setBlogMsg] = useState('');

    const categories = ['General', 'Reviews', 'Top Lists', 'News', 'Guides', 'Analysis', 'Recommendations'];

    useEffect(() => {
        if (!isWriter && !isAdmin) { navigate('/login'); return; }
        fetchBlogs();
    }, [isWriter, isAdmin]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogAPI.getMyBlogs();
            setBlogs(res.data.blogs);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                title: blogForm.title,
                content: blogForm.content,
                category: blogForm.category,
                tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: blogForm.status,
                coverImage: blogForm.coverImage
            };
            if (editingBlog) {
                await blogAPI.updateBlog(editingBlog, data);
                setBlogMsg('✅ Blog updated!');
            } else {
                await blogAPI.createBlog(data);
                setBlogMsg('✅ Blog created!');
            }
            setBlogForm({ title: '', content: '', category: 'General', tags: '', status: 'draft', coverImage: '' });
            setEditingBlog(null);
            fetchBlogs();
        } catch (err) { setBlogMsg(`❌ ${err.message}`); }
    };

    const handleEditBlog = (blog) => {
        setBlogForm({
            title: blog.title,
            content: blog.content,
            category: blog.category,
            tags: blog.tags?.join(', ') || '',
            status: blog.status,
            coverImage: blog.coverImage || ''
        });
        setEditingBlog(blog._id);
        setActiveSection('write');
    };

    const handleDeleteBlog = async (id) => {
        if (!confirm('Delete this blog?')) return;
        try {
            await blogAPI.deleteBlog(id);
            fetchBlogs();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="dashboard" id="writer-dashboard">
            <div className="dashboard__sidebar">
                <div className="dashboard__sidebar-header">
                    <span className="navbar__logo-icon" style={{ width: 32, height: 32, fontSize: '1rem' }}>✏️</span>
                    <span className="dashboard__sidebar-title">Writer</span>
                </div>
                <nav className="dashboard__nav">
                    {[
                        { id: 'my-blogs', label: '📝 My Blogs' },
                        { id: 'write', label: '✍️ Write' },
                    ].map(item => (
                        <button
                            key={item.id}
                            className={`dashboard__nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="dashboard__sidebar-footer">
                    <span className="dashboard__user-name">{user?.name}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>
            </div>

            <div className="dashboard__main">
                {/* My Blogs */}
                {activeSection === 'my-blogs' && (
                    <div className="dashboard__section" id="writer-my-blogs">
                        <h2 className="dashboard__heading">My Blogs ({blogs.length})</h2>

                        {user?.assignedTopics?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned topics: </span>
                                {user.assignedTopics.map(t => <span key={t} className="badge badge-purple" style={{ marginRight: '0.3rem' }}>{t}</span>)}
                            </div>
                        )}

                        <div className="dashboard__table-wrap">
                            <table className="dashboard__table">
                                <thead><tr><th>Title</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {blogs.map(blog => (
                                        <tr key={blog._id}>
                                            <td className="dashboard__table-title">{blog.title}</td>
                                            <td><span className={`badge ${blog.status === 'published' ? 'badge-green' : 'badge-gold'}`}>{blog.status}</span></td>
                                            <td>{blog.views}</td>
                                            <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="dashboard__table-actions">
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEditBlog(blog)}>Edit</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBlog(blog._id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {blogs.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                You haven't written any blogs yet. Start writing!
                            </p>
                        )}
                    </div>
                )}

                {/* Write */}
                {activeSection === 'write' && (
                    <div className="dashboard__section" id="writer-write">
                        <h2 className="dashboard__heading">{editingBlog ? 'Edit Blog' : 'Write New Blog'}</h2>
                        <form className="dashboard__form glass" onSubmit={handleBlogSubmit}>
                            <div className="input-group">
                                <label>Title</label>
                                <input className="input-field" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Cover Image URL</label>
                                <input className="input-field" value={blogForm.coverImage} onChange={e => setBlogForm({ ...blogForm, coverImage: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="dashboard__form-row">
                                <div className="input-group">
                                    <label>Category</label>
                                    <select className="input-field" value={blogForm.category} onChange={e => setBlogForm({ ...blogForm, category: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Tags (comma separated)</label>
                                    <input className="input-field" value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Status</label>
                                    <select className="input-field" value={blogForm.status} onChange={e => setBlogForm({ ...blogForm, status: e.target.value })}>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Content (HTML supported)</label>
                                <textarea className="input-field" rows={15} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} required />
                            </div>
                            <div className="dashboard__form-actions">
                                <button type="submit" className="btn btn-primary">{editingBlog ? 'Update' : 'Publish'} Blog</button>
                                {editingBlog && <button type="button" className="btn btn-secondary" onClick={() => { setEditingBlog(null); setBlogForm({ title: '', content: '', category: 'General', tags: '', status: 'draft', coverImage: '' }); }}>Cancel</button>}
                            </div>
                            {blogMsg && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{blogMsg}</p>}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
