const API_BASE = 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('awf_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ─── Auth API ──────────────────────────────
export const authAPI = {
    login: (email, password) =>
        apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
    signup: (name, email, password) =>
        apiRequest('/auth/signup', { method: 'POST', body: { name, email, password } }),
    getMe: () =>
        apiRequest('/auth/me'),
    updateProfile: (data) =>
        apiRequest('/auth/profile', { method: 'PUT', body: data }),
    changePassword: (currentPassword, newPassword) =>
        apiRequest('/auth/change-password', { method: 'PUT', body: { currentPassword, newPassword } }),
    forgotPassword: (email) =>
        apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
    verifyOTP: (email, otp) =>
        apiRequest('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
    resetPassword: (email, otp, newPassword) =>
        apiRequest('/auth/reset-password', { method: 'POST', body: { email, otp, newPassword } }),
};

// ─── Blog API ──────────────────────────────
export const blogAPI = {
    getBlogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/blogs?${query}`);
    },
    getBlogBySlug: (slug) =>
        apiRequest(`/blogs/${slug}`),
    getBlogById: (id) =>
        apiRequest(`/blogs/id/${id}`),
    getMyBlogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/blogs/my/posts?${query}`);
    },
    createBlog: (data) =>
        apiRequest('/blogs', { method: 'POST', body: data }),
    updateBlog: (id, data) =>
        apiRequest(`/blogs/${id}`, { method: 'PUT', body: data }),
    deleteBlog: (id) =>
        apiRequest(`/blogs/${id}`, { method: 'DELETE' }),
};

// ─── Comment API ───────────────────────────
export const commentAPI = {
    submitComment: (data) =>
        apiRequest('/comments', { method: 'POST', body: data }),
    getBlogComments: (blogId) =>
        apiRequest(`/comments/blog/${blogId}`),
    getPending: () =>
        apiRequest('/comments/pending'),
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/comments/all?${query}`);
    },
    approve: (id) =>
        apiRequest(`/comments/${id}/approve`, { method: 'PUT' }),
    reject: (id) =>
        apiRequest(`/comments/${id}/reject`, { method: 'PUT' }),
    reply: (id, reply) =>
        apiRequest(`/comments/${id}/reply`, { method: 'PUT', body: { reply } }),
    delete: (id) =>
        apiRequest(`/comments/${id}`, { method: 'DELETE' }),
};

// ─── Admin API ─────────────────────────────
export const adminAPI = {
    getStats: () =>
        apiRequest('/admin/stats'),
    getAllBlogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/blogs?${query}`);
    },
    getWriters: () =>
        apiRequest('/admin/writers'),
    createWriter: (data) =>
        apiRequest('/admin/writers', { method: 'POST', body: data }),
    assignTopics: (id, topics) =>
        apiRequest(`/admin/writers/${id}/assign`, { method: 'PUT', body: { topics } }),
    toggleWriter: (id) =>
        apiRequest(`/admin/writers/${id}/toggle`, { method: 'PUT' }),
    deleteWriter: (id) =>
        apiRequest(`/admin/writers/${id}`, { method: 'DELETE' }),
    getAllUsers: () =>
        apiRequest('/admin/users'),
    updateUserRole: (id, role) =>
        apiRequest(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
};

// ─── Anime API ─────────────────────────────
export const animeAPI = {
    search: (q, page = 1) =>
        apiRequest(`/anime/search?q=${encodeURIComponent(q)}&page=${page}`),
    getTrending: () =>
        apiRequest('/anime/trending'),
    addToTracker: (data) =>
        apiRequest('/anime/track', { method: 'POST', body: data }),
    getTracker: (sessionId, status) => {
        const params = new URLSearchParams({ sessionId });
        if (status) params.append('status', status);
        return apiRequest(`/anime/tracker?${params}`);
    },
    updateTracker: (id, data) =>
        apiRequest(`/anime/tracker/${id}`, { method: 'PUT', body: data }),
    removeFromTracker: (id) =>
        apiRequest(`/anime/tracker/${id}`, { method: 'DELETE' }),
};
