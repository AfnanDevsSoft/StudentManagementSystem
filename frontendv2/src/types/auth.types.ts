export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: {
        id: string;
        name: string;
    };
}

export interface Branch {
    id: string;
    name: string;
    code: string;
    isMain?: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    refresh_token?: string;
    user?: User;
}
