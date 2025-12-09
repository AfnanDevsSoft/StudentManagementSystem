import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, endpoints } from '../lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: {
        id: string;
        name: string;
        permissions: any;
    };
    branch?: {
        id: string;
        name: string;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get(endpoints.auth.me);
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post(endpoints.auth.login, { username, password });
            const { token, refresh_token, user: userData } = response.data;
            localStorage.setItem('access_token', token);
            if (refresh_token) {
                localStorage.setItem('refresh_token', refresh_token);
            }
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
