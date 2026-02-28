// src/hooks/useBlogData.js
import { useState, useEffect } from 'react';
import * as firestoreService from '@/lib/firestore';

export const useBlogData = () => {
    const [data, setData] = useState({
        articles: [],
        recentStories: [],
        popularArticles: [],
        featuredArticle: null,
        upcomingEvents: [],
        categories: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setData(prev => ({ ...prev, loading: true, error: null }));

                // Fetch all data in parallel
                const [
                    articles,
                    recentStories,
                    popularArticles,
                    featuredArticle,
                    upcomingEvents,
                    categories,
                ] = await Promise.all([
                    firestoreService.fetchBlogPosts(),
                    firestoreService.fetchRecentStories(),
                    firestoreService.fetchPopularArticles(),
                    firestoreService.fetchFeaturedArticle(),
                    firestoreService.fetchUpcomingEvents(),
                    firestoreService.fetchCategories(),
                ]);

                setData({
                    articles,
                    recentStories,
                    popularArticles,
                    featuredArticle,
                    upcomingEvents,
                    categories,
                    loading: false,
                    error: null,
                });

            } catch (error) {
                console.error('Error fetching blog data:', error);
                setData(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load content. Please refresh the page.',
                }));
            }
        };

        fetchAllData();
    }, []);

    const subscribeNewsletter = async (email) => {
        try {
            return await firestoreService.subscribeToNewsletter(email);
        } catch (error) {
            console.error('Error subscribing:', error);
            return { success: false, message: 'Subscription failed' };
        }
    };

    const trackPostView = async (postId) => {
        try {
            const userAgent = navigator.userAgent || '';
            return await firestoreService.trackPostView(postId, userAgent);
        } catch (error) {
            console.error('Error tracking view:', error);
            return { success: false, error: error.message };
        }
    };

    const likePost = async (postId) => {
        try {
            return await firestoreService.likePost(postId);
        } catch (error) {
            console.error('Error liking post:', error);
            return { success: false, error: error.message };
        }
    };

    const unlikePost = async (postId) => {
        try {
            return await firestoreService.unlikePost(postId);
        } catch (error) {
            console.error('Error unliking post:', error);
            return { success: false, error: error.message };
        }
    };

    const checkUserLike = async (postId) => {
        try {
            return await firestoreService.checkUserLike(postId);
        } catch (error) {
            console.error('Error checking user like:', error);
            return false;
        }
    };

    const addComment = async (postId, commentData) => {
        try {
            return await firestoreService.addComment(postId, commentData);
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
    };

    return {
        ...data,
        subscribeNewsletter,
        trackPostView,
        likePost,
        unlikePost,
        checkUserLike,
        addComment,
    };
};