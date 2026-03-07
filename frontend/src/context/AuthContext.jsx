import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('awf_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await authAPI.getMe();
                setUser(res.data.user);
            } catch (err) {
                localStorage.removeItem('awf_token');
                localStorage.removeItem('awf_user');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const res = await authAPI.login(email, password);
            const { token, user: userData } = res.data;
            localStorage.setItem('awf_token', token);
            localStorage.setItem('awf_user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const signup = async (name, email, password) => {
        setError(null);
        try {
            const res = await authAPI.signup(name, email, password);
            const { token, user: userData } = res.data;
            localStorage.setItem('awf_token', token);
            localStorage.setItem('awf_user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('awf_token');
        localStorage.removeItem('awf_user');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isWriter = user?.role === 'writer';
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            signup,
            logout,
            isAdmin,
            isWriter,
            isAuthenticated,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};
