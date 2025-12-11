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
    // Entity IDs for role-specific data fetching
    studentId?: string;
    teacherId?: string;
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

            // Handle both possible response formats
            const data = response.data?.data || response.data;
            const token = data.access_token || data.token;
            const refreshToken = data.refresh_token;
            const userData = data.user;

            if (!token) {
                throw new Error('No token received from server');
            }

            // Store tokens
            localStorage.setItem('access_token', token);
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }

            // Transform user data to match our interface
            const user = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                first_name: userData.firstName || userData.first_name,
                last_name: userData.lastName || userData.last_name,
                role: userData.role,
                // Include entity IDs for role-specific data fetching
                studentId: userData.studentId,
                teacherId: userData.teacherId,
            };

            localStorage.setItem('user', JSON.stringify(user));
            setUser(user as User);
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
