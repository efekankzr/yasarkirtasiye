import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Persist the state across reloads optionally, but we initialize from localStorage directly here for simplicity
const getTokenFromStorage = () => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};

const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),

  login: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
