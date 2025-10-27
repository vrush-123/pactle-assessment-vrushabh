import { create } from 'zustand';
import { storage } from '../lib/storage';
import type { User, Role } from '../types';

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  isInitialized: boolean;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.getUser(),
  token: storage.getToken(),
  isInitialized: true,
  
  login: (user, token) => {
    storage.setUser(user);
    storage.setToken(token);
    set({ user, token });
  },
  
  logout: () => {
    storage.clearUser();
    storage.clearToken();
    set({ user: null, token: null });
  },
  
  switchRole: (newRole) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, role: newRole };
        storage.setUser(updatedUser); 
        return { user: updatedUser };
      }
      return {};
    });
  },
}));