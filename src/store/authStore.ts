import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProfileStore } from './profileStore';

export type UserRole = 'Guest' | 'Candidate' | 'Employer' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profilePhoto?: string;
  candidateProfile?: any;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  updateAccessToken: (accessToken: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, accessToken) => {
        const normalized = { ...user, id: user.id || (user as any)._id || '' };
        if (normalized.candidateProfile) {
          useProfileStore.getState().initialize(normalized.candidateProfile);
        }
        set({ user: normalized, accessToken, isAuthenticated: true, isLoading: false });
      },
      clearAuth: () => {
        useProfileStore.getState().clearProfile();
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
      updateAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'job-board-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
