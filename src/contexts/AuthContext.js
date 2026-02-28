// src/contexts/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper functions
    const isAdmin = () => role === 'admin';
    const isEditor = () => role === 'editor';
    const isModerator = () => role === 'moderator';
    const isAuthenticated = () => !!user;

    const canComment = () => {
        if (!user) return false;
        const restrictedRoles = ['banned', 'restricted'];
        if (profile?.roles?.some(r => restrictedRoles.includes(r))) {
            return false;
        }
        return true;
    };

    const canModerate = () => isAdmin() || isEditor() || isModerator();
    const isCommentOwner = (commentUserId) => user?.uid === commentUserId;
    const canDeleteComment = (commentUserId) => canModerate() || isCommentOwner(commentUserId);

    /**
     * Fetch user profile from Firestore
     */
    const fetchUserProfile = useCallback(async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
                const data = snap.data();
                setProfile(data);
                setRole(data.roles?.[0] || 'user');
            } else {
                setProfile(null);
                setRole('user');
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    }, []);

    /**
     * Create Firestore user document
     */
    const createUserDocument = async (userId, userData = {}) => {
        const userRef = doc(db, 'users', userId);

        await setDoc(userRef, {
            displayName: userData.displayName || '',
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            roles: ['user'], // Default role
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            bookmarksCount: 0,
            likesCount: 0,
            commentsCount: 0,
            ...userData,
        });

        await fetchUserProfile(userId);
    };

    /**
     * Update last login timestamp
     */
    const updateLastLogin = async (userId) => {
        try {
            const userRef = doc(db, "users", userId);

            // Use updateDoc instead of setDoc with merge
            await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("Failed to update last login:", err);
            // Don't fail the login if this doesn't work
        }
    };

    /**
     * Auth state listener
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUser(null);
                setProfile(null);
                setRole('user');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [fetchUserProfile]);

    // Auth actions
    const loginWithEmail = async (email, password) => {
        setError(null);
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            await updateLastLogin(res.user.uid);
            return { success: true };
        } catch (err) {
            setError('Invalid email or password');
            return { success: false };
        }
    };

    const signupWithEmail = async (email, password, displayName) => {
        setError(null);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName });

            await createUserDocument(res.user.uid, { displayName, email });
            return { success: true };
        } catch (err) {
            setError('Signup failed');
            return { success: false };
        }
    };

    const loginWithGoogle = async () => {
        setError(null);
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const snap = await getDoc(doc(db, 'users', res.user.uid));

            if (!snap.exists()) {
                await createUserDocument(res.user.uid, {
                    displayName: res.user.displayName,
                    email: res.user.email,
                    photoURL: res.user.photoURL,
                });
            } else {
                await updateLastLogin(res.user.uid);
            }

            return { success: true };
        } catch {
            setError('Google login failed');
            return { success: false };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        profile,
        role,
        loading,
        error,
        isAuthenticated,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile: () => user && fetchUserProfile(user.uid),
        // Helper functions
        isAdmin,
        isEditor,
        isModerator,
        canComment,
        canModerate,
        isCommentOwner,
        canDeleteComment,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}