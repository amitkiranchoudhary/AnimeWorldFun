import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, blogAPI, commentAPI } from '../utils/api';
import './Dashboard.css';

export default function AdminDashboard() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState(null);
    const [writers, setWriters] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [pendingComments, setPendingComments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Writer form
    const [writerForm, setWriterForm] = useState({ name: '', email: '', password: '', assignedTopics: '' });
    const [writerMsg, setWriterMsg] = useState('');

    // Blog form
    const [blogForm, setBlogForm] = useState({ title: '', content: '', category: 'General', tags: '', status: 'draft', coverImage: '' });
    const [editingBlog, setEditingBlog] = useState(null);
    const [blogMsg, setBlogMsg] = useState('');

    // User role management
    const [roleMsg, setRoleMsg] = useState('');
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (!isAdmin) { navigate('/login'); return; }
        fetchAll();
    }, [isAdmin]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, writersRes, blogsRes, commentsRes, usersRes] = await Promise.allSettled([
                adminAPI.getStats(),
                adminAPI.getWriters(),
                adminAPI.getAllBlogs(),
                commentAPI.getPending(),
                adminAPI.getAllUsers()
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
            if (writersRes.status === 'fulfilled') setWriters(writersRes.value.data.writers);
            if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value.data.blogs);
            if (commentsRes.status === 'fulfilled') setPendingComments(commentsRes.value.data.comments);
            if (usersRes.status === 'fulfilled') setAllUsers(usersRes.value.data.users);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreateWriter = async (e) => {
        e.preventDefault();
        try {
            const res = await adminAPI.createWriter({
                name: writerForm.name,
                email: writerForm.email,
                password: writerForm.password,
                assignedTopics: writerForm.assignedTopics.split(',').map(t => t.trim()).filter(Boolean)
            });
            setWriterMsg(`✅ Writer created! Token: ${res.data.writerToken.substring(0, 30)}...`);
            setWriterForm({ name: '', email: '', password: '', assignedTopics: '' });
            fetchAll();
        } catch (err) { setWriterMsg(`❌ ${err.message}`); }
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
            fetchAll();
        } catch (err) { setBlogMsg(`❌ ${err.message}`); }
    };

    const handleApproveComment = async (id) => {
        await commentAPI.approve(id);
        fetchAll();
    };

    const handleRejectComment = async (id) => {
        await commentAPI.reject(id);
        fetchAll();
    };

    const handleDeleteBlog = async (id) => {
        if (!confirm('Delete this blog?')) return;
        await blogAPI.deleteBlog(id);
        fetchAll();
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
        setActiveSection('blogs');
    };

    const handleToggleWriter = async (id) => {
        await adminAPI.toggleWriter(id);
        fetchAll();
    };

    const handleDeleteWriter = async (id) => {
        if (!confirm('Remove this writer?')) return;
        await adminAPI.deleteWriter(id);
        fetchAll();
    };

    const handleRoleChange = async (userId, newRole) => {
        setRoleMsg('');
        try {
            const res = await adminAPI.updateUserRole(userId, newRole);
            setRoleMsg(`✅ ${res.message}`);
            fetchAll();
        } catch (err) {
            setRoleMsg(`❌ ${err.message}`);
        }
    };

    const categories = ['General', 'Reviews', 'Top Lists', 'News', 'Guides', 'Analysis', 'Recommendations'];

    const filteredUsers = allUsers.filter(u => {
        if (!userSearch) return true;
        const q = userSearch.toLowerCase();
        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

    const getRoleBadgeClass = (role) => {
        if (role === 'admin') return 'badge-red';
        if (role === 'writer') return 'badge-purple';
        return 'badge-green';
    };

    if (loading && !stats) {
        return <div className="dashboard"><div className="container"><p style={{ padding: '6rem 0', textAlign: 'center' }}>Loading dashboard...</p></div></div>;
    }

    return (
        <div className="dashboard" id="admin-dashboard">
            <div className="dashboard__sidebar">
                <div className="dashboard__sidebar-header">
                    <img src="/images/logo.png" alt="AnimeWorldFun" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    <span className="dashboard__sidebar-title">Admin</span>
                </div>
                <nav className="dashboard__nav">
                    {[
                        { id: 'overview', label: '📊 Overview' },
                        { id: 'blogs', label: '✍️ Blogs' },
                        { id: 'comments', label: '💬 Comments' },
                        { id: 'writers', label: '👥 Writers' },
                        { id: 'users', label: '🛡️ User Management' },
                    ].map(item => (
                        <button
                            key={item.id}
                            className={`dashboard__nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            {item.label}
                            {item.id === 'comments' && pendingComments.length > 0 && (
                                <span className="dashboard__badge">{pendingComments.length}</span>
                            )}
                            {item.id === 'users' && (
                                <span className="dashboard__badge" style={{ background: 'var(--accent-purple)' }}>{allUsers.length}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="dashboard__sidebar-footer">
                    <span className="dashboard__user-name">{user?.name}</span>
                    {user?.loyaltyBadge && (
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{user.loyaltyBadge.emoji} {user.loyaltyBadge.tier}</span>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>
            </div>

            <div className="dashboard__main">
                {/* Overview */}
                {activeSection === 'overview' && stats && (
                    <div className="dashboard__section" id="admin-overview">
                        <h2 className="dashboard__heading">Dashboard Overview</h2>
                        <div className="dashboard__stats-grid">
                            {[
                                { label: 'Total Blogs', value: stats.totalBlogs, color: 'purple' },
                                { label: 'Published', value: stats.publishedBlogs, color: 'green' },
                                { label: 'Drafts', value: stats.draftBlogs, color: 'gold' },
                                { label: 'Total Views', value: stats.totalViews, color: 'blue' },
                                { label: 'Pending Comments', value: stats.pendingComments, color: 'pink' },
                                { label: 'Active Writers', value: stats.activeWriters, color: 'purple' },
                                { label: 'Total Users', value: allUsers.length, color: 'blue' },
                            ].map(s => (
                                <div key={s.label} className={`dashboard__stat-card dashboard__stat-card--${s.color}`}>
                                    <span className="dashboard__stat-value">{s.value}</span>
                                    <span className="dashboard__stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Blogs */}
                {activeSection === 'blogs' && (
                    <div className="dashboard__section" id="admin-blogs">
                        <h2 className="dashboard__heading">{editingBlog ? 'Edit Blog' : 'Create Blog'}</h2>
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
                                    <input className="input-field" value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} placeholder="naruto, action" />
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
                                <textarea className="input-field" rows={12} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} required />
                            </div>
                            <div className="dashboard__form-actions">
                                <button type="submit" className="btn btn-primary">{editingBlog ? 'Update' : 'Create'} Blog</button>
                                {editingBlog && <button type="button" className="btn btn-secondary" onClick={() => { setEditingBlog(null); setBlogForm({ title: '', content: '', category: 'General', tags: '', status: 'draft', coverImage: '' }); }}>Cancel</button>}
                            </div>
                            {blogMsg && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{blogMsg}</p>}
                        </form>

                        <h3 className="dashboard__subheading">All Blogs ({blogs.length})</h3>
                        <div className="dashboard__table-wrap">
                            <table className="dashboard__table">
                                <thead>
                                    <tr><th>Title</th><th>Author</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {blogs.map(blog => (
                                        <tr key={blog._id}>
                                            <td className="dashboard__table-title">{blog.title}</td>
                                            <td>{blog.author?.name}</td>
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
                    </div>
                )}

                {/* Comments */}
                {activeSection === 'comments' && (
                    <div className="dashboard__section" id="admin-comments">
                        <h2 className="dashboard__heading">Pending Comments ({pendingComments.length})</h2>
                        {pendingComments.length > 0 ? (
                            <div className="dashboard__comments-list">
                                {pendingComments.map(c => (
                                    <div key={c._id} className="dashboard__comment-card glass">
                                        <div className="dashboard__comment-header">
                                            <strong>{c.visitorName}</strong>
                                            <span className="dashboard__comment-email">{c.visitorEmail}</span>
                                            <span className="badge badge-gold">on: {c.blog?.title || 'Unknown blog'}</span>
                                        </div>
                                        <p className="dashboard__comment-content">{c.content}</p>
                                        <div className="dashboard__comment-actions">
                                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveComment(c._id)}>✓ Approve</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectComment(c._id)}>✕ Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No pending comments 🎉</p>
                        )}
                    </div>
                )}

                {/* Writers */}
                {activeSection === 'writers' && (
                    <div className="dashboard__section" id="admin-writers">
                        <h2 className="dashboard__heading">Create Writer</h2>
                        <form className="dashboard__form glass" onSubmit={handleCreateWriter}>
                            <div className="dashboard__form-row">
                                <div className="input-group">
                                    <label>Name</label>
                                    <input className="input-field" value={writerForm.name} onChange={e => setWriterForm({ ...writerForm, name: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input type="email" className="input-field" value={writerForm.email} onChange={e => setWriterForm({ ...writerForm, email: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" className="input-field" value={writerForm.password} onChange={e => setWriterForm({ ...writerForm, password: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Assigned Topics (comma separated)</label>
                                <input className="input-field" value={writerForm.assignedTopics} onChange={e => setWriterForm({ ...writerForm, assignedTopics: e.target.value })} placeholder="Shonen, Reviews, Top Lists" />
                            </div>
                            <button type="submit" className="btn btn-primary">Create Writer</button>
                            {writerMsg && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{writerMsg}</p>}
                        </form>

                        <h3 className="dashboard__subheading">Writers ({writers.length})</h3>
                        <div className="dashboard__writers-grid">
                            {writers.map(w => (
                                <div key={w._id} className="dashboard__writer-card glass">
                                    <div className="dashboard__writer-avatar">{w.name[0]}</div>
                                    <h4>{w.name}</h4>
                                    <p className="dashboard__writer-email">{w.email}</p>
                                    <span className={`badge ${w.isActive ? 'badge-green' : 'badge-red'}`}>{w.isActive ? 'Active' : 'Inactive'}</span>
                                    <p className="dashboard__writer-blogs">{w.blogCount} blogs</p>
                                    {w.assignedTopics?.length > 0 && (
                                        <div className="dashboard__writer-topics">
                                            {w.assignedTopics.map(t => <span key={t} className="badge badge-purple">{t}</span>)}
                                        </div>
                                    )}
                                    <div className="dashboard__writer-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggleWriter(w._id)}>
                                            {w.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWriter(w._id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── User Management ─────────────────────── */}
                {activeSection === 'users' && (
                    <div className="dashboard__section" id="admin-users">
                        <h2 className="dashboard__heading">🛡️ User Management</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Manage all registered users. Assign roles directly by email. Roles: <span className="badge badge-red">admin</span> <span className="badge badge-purple">writer</span> <span className="badge badge-green">visitor</span>
                        </p>

                        {roleMsg && <div className={`forgot__${roleMsg.startsWith('✅') ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>{roleMsg}</div>}

                        <div className="input-group" style={{ maxWidth: 400, marginBottom: '1.5rem' }}>
                            <input
                                className="input-field"
                                placeholder="🔍 Search by name or email..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                        </div>

                        <div className="dashboard__table-wrap">
                            <table className="dashboard__table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Badge</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Change Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="dashboard__writer-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{u.name?.[0]}</div>
                                                    {u.name}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', opacity: 0.8 }}>{u.email}</td>
                                            <td><span className={`badge ${getRoleBadgeClass(u.role)}`}>{u.role}</span></td>
                                            <td>
                                                {u.loyaltyBadge && (
                                                    <span className="badge badge-gold" title={u.loyaltyBadge.label}>
                                                        {u.loyaltyBadge.emoji} {u.loyaltyBadge.tier}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                            <td>
                                                {u._id !== user?.id ? (
                                                    <select
                                                        className="input-field"
                                                        value={u.role}
                                                        onChange={e => handleRoleChange(u._id, e.target.value)}
                                                        style={{ width: 'auto', minWidth: 100, padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                                                    >
                                                        <option value="visitor">Visitor</option>
                                                        <option value="writer">Writer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>You (locked)</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
