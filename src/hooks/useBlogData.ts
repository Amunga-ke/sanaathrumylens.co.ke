// useBlogData Hook - Prisma Implementation
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  author?: {
    id: string;
    name: string;
    slug: string;
    avatar?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  featured?: boolean;
  status: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isOnline?: boolean;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export function useBlogData() {
  const [data, setData] = useState<{
    articles: Article[];
    recentStories: Article[];
    popularArticles: Article[];
    featuredArticle: Article | null;
    upcomingEvents: Event[];
    categories: Category[];
    loading: boolean;
    error: string | null;
  }>({
    articles: [],
    recentStories: [],
    popularArticles: [],
    featuredArticle: null,
    upcomingEvents: [],
    categories: [],
    loading: true,
    error: null,
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const [articlesRes, recentRes, popularRes, featuredRes, eventsRes, categoriesRes] =
          await Promise.all([
            fetch('/api/posts?limit=6'),
            fetch('/api/posts/recent?limit=4'),
            fetch('/api/posts/popular?limit=3'),
            fetch('/api/posts/featured'),
            fetch('/api/events/upcoming?limit=4'),
            fetch('/api/categories'),
          ]);

        const articlesData = await articlesRes.json();
        const recentData = await recentRes.json();
        const popularData = await popularRes.json();
        const featuredData = await featuredRes.json();
        const eventsData = await eventsRes.json();
        const categoriesData = await categoriesRes.json();

        setData({
          articles: articlesData.posts || [],
          recentStories: recentData.posts || [],
          popularArticles: popularData.posts || [],
          featuredArticle: featuredData.post || null,
          upcomingEvents: eventsData.events || [],
          categories: categoriesData.categories || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load content. Please refresh the page.',
        }));
      }
    };

    fetchAllData();
  }, []);

  const subscribeNewsletter = async (email: string) => {
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error subscribing:', error);
      return { success: false, message: 'Subscription failed' };
    }
  };

  const likePost = async (postId: string) => {
    if (!user) {
      return { success: false, message: 'Please log in to like posts' };
    }
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: 'Failed to like post' };
    }
  };

  const unlikePost = async (postId: string) => {
    if (!user) {
      return { success: false, message: 'Please log in to unlike posts' };
    }
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error unliking post:', error);
      return { success: false, error: 'Failed to unlike post' };
    }
  };

  const checkUserLike = async (postId: string) => {
    if (!user) return false;
    try {
      const response = await fetch(`/api/posts/${postId}/like`);
      const data = await response.json();
      return data.liked || false;
    } catch (error) {
      console.error('Error checking like:', error);
      return false;
    }
  };

  const trackPostView = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
      });
      return { success: true };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { success: false };
    }
  };

  const addComment = async (postId: string, commentData: { content: string; parentId?: string }) => {
    if (!user) {
      return { success: false, message: 'Please log in to comment' };
    }
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: 'Failed to add comment' };
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
}
