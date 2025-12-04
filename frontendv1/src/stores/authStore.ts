import { create } from "zustand";
import { User, UserRole, getRoleName } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => set({ user: null, token: null, isAuthenticated: false }),

  hasPermission: (permission: string) => {
    const { user } = get();
    return user?.permissions?.includes(permission) ?? false;
  },

  hasRole: (role: UserRole) => {
    const { user } = get();
    if (!user) return false;
    const userRole = getRoleName(user.role);
    return userRole === role;
  },
}));
