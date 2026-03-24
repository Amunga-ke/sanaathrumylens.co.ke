// AuthContext - NextAuth Integration
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from 'next-auth';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import type { Role } from '@prisma/client';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isModerator: () => boolean;
  canComment: () => boolean;
  canModerate: () => boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Safely access useSession - may be undefined during SSR/build
  const sessionHook = useSession?.() ?? { data: null, status: 'loading', update: undefined };
  const session = sessionHook.data ?? null;
  const status = sessionHook.status ?? 'loading';
  const update = sessionHook.update;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(status === 'loading');
  }, [status]);

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role as Role | undefined,
      }
    : null;

  // Helper functions
  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isEditor = () => user?.role === 'EDITOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isModerator = () => user?.role === 'MODERATOR' || user?.role === 'EDITOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canComment = () => !!user && user.role !== 'BANNED';
  const canModerate = () => isAdmin() || isEditor() || isModerator();

  // Login with email/password
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      await nextAuthSignIn('google', { callbackUrl: '/' });
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed' };
    }
  };

  // Signup with email/password
  const signupWithEmail = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      // Auto-login after registration
      const loginResult = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        return { success: false, error: 'Registration successful but login failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  // Logout
  const logout = async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to send reset email' };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An error occurred' };
    }
  };

  // Refresh session
  const refreshSession = useCallback(() => {
    update?.();
  }, [update]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    isAdmin,
    isEditor,
    isModerator,
    canComment,
    canModerate,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    logout,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
