// // src/hooks/useAuth.js
// 'use client';

// import { useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext';

// /**
//  * Custom hook to access authenticated user info and roles.
//  */
// export function useAuth() {
//     const context = useContext(AuthContext);

//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }

//     const { user, profile, role, loading } = context;

//     /**
//      * Helper functions to simplify role checks
//      */
//     const isAdmin = () => role === 'admin';
//     const isEditor = () => role === 'editor';
//     const isModerator = () => role === 'moderator';
//     const isAuthenticated = () => !!user;

//     /**
//      * Check if user can comment
//      */
//     const canComment = () => {
//         if (!user) return false;

//         // Block users with restricted roles from commenting
//         const restrictedRoles = ['banned', 'restricted'];
//         if (profile?.roles?.some(r => restrictedRoles.includes(r))) {
//             return false;
//         }

//         return true;
//     };

//     /**
//      * Check if user can moderate comments
//      */
//     const canModerate = () => {
//         return isAdmin() || isEditor() || isModerator();
//     };

//     /**
//      * Check if user owns a comment
//      */
//     const isCommentOwner = (commentUserId) => {
//         return user?.uid === commentUserId;
//     };

//     /**
//      * Check if user can delete a comment
//      */
//     const canDeleteComment = (commentUserId) => {
//         return canModerate() || isCommentOwner(commentUserId);
//     };

//     return {
//         user,
//         profile,
//         role,
//         loading,
//         isAdmin,
//         isEditor,
//         isModerator,
//         isAuthenticated,
//         canComment,
//         canModerate,
//         isCommentOwner,
//         canDeleteComment,
//     };
// }