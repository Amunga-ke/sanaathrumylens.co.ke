// src/contexts/AuthContext.js
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}

function AuthContextProvider({ children }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const user = session?.user
  const role = session?.user?.role || 'USER'

  // Fetch extended user profile
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return

    try {
      const res = await fetch(`/api/users/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else {
      setLoading(false)
      if (user) {
        fetchUserProfile()
      }
    }
  }, [status, user, fetchUserProfile])

  // Helper functions
  const isAdmin = () => role === 'ADMIN'
  const isEditor = () => role === 'EDITOR'
  const isModerator = () => role === 'MODERATOR'
  const isAuthenticated = () => !!user && status === 'authenticated'

  const canComment = () => {
    if (!user) return false
    const restrictedRoles = ['BANNED']
    return !restrictedRoles.includes(role)
  }

  const canModerate = () => isAdmin() || isEditor() || isModerator()
  const isCommentOwner = (commentUserId) => user?.id === commentUserId
  const canDeleteComment = (commentUserId) => canModerate() || isCommentOwner(commentUserId)

  // Auth actions
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' }
      }

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const loginWithGoogle = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
      return { success: true }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, error: 'Google login failed' }
    }
  }

  const signupWithEmail = async (email, password, displayName) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: displayName }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || 'Signup failed' }
      }

      // Auto login after signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: 'Auto-login failed after signup' }
      }

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Signup failed' }
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const resetPassword = async (email) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message }
      }

      return { success: true, message: data.message }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Password reset failed' }
    }
  }

  const refreshProfile = () => {
    fetchUserProfile()
    update()
  }

  const value = {
    user,
    profile,
    role,
    loading: loading || status === 'loading',
    isAuthenticated,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile,
    // Helper functions
    isAdmin,
    isEditor,
    isModerator,
    canComment,
    canModerate,
    isCommentOwner,
    canDeleteComment,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
