// src/hooks/useBlogData.js
import { useState, useEffect } from 'react'
import {
  fetchBlogPosts,
  fetchRecentStories,
  fetchPopularArticles,
  fetchFeaturedArticle,
  fetchUpcomingEvents,
  fetchCategories,
  subscribeToNewsletter,
  likePost,
  unlikePost,
  checkUserLike,
  addComment,
  trackPostView,
} from '@/lib/db'
import { useSession } from 'next-auth/react'

export const useBlogData = () => {
  const { data: session } = useSession()

  const [data, setData] = useState({
    articles: [],
    recentStories: [],
    popularArticles: [],
    featuredArticle: null,
    upcomingEvents: [],
    categories: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))

        // Fetch all data in parallel
        const [
          articles,
          recentStories,
          popularArticles,
          featuredArticle,
          upcomingEvents,
          categories,
        ] = await Promise.all([
          fetchBlogPosts(12),
          fetchRecentStories(4),
          fetchPopularArticles(3),
          fetchFeaturedArticle(),
          fetchUpcomingEvents(4),
          fetchCategories(),
        ])

        setData({
          articles,
          recentStories,
          popularArticles,
          featuredArticle,
          upcomingEvents,
          categories,
          loading: false,
          error: null,
        })

      } catch (error) {
        console.error('Error fetching blog data:', error)
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load content. Please refresh the page.',
        }))
      }
    }

    fetchAllData()
  }, [])

  const handleSubscribeNewsletter = async (email) => {
    try {
      return await subscribeToNewsletter(email)
    } catch (error) {
      console.error('Error subscribing:', error)
      return { success: false, message: 'Subscription failed' }
    }
  }

  const handleTrackPostView = async (postId) => {
    try {
      const userId = session?.user?.id || undefined
      return await trackPostView(postId, userId)
    } catch (error) {
      console.error('Error tracking view:', error)
      return { success: false, error: error.message }
    }
  }

  const handleLikePost = async (postId) => {
    try {
      if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to like posts' }
      }
      return await likePost(postId, session.user.id)
    } catch (error) {
      console.error('Error liking post:', error)
      return { success: false, error: error.message }
    }
  }

  const handleUnlikePost = async (postId) => {
    try {
      if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to unlike posts' }
      }
      return await unlikePost(postId, session.user.id)
    } catch (error) {
      console.error('Error unliking post:', error)
      return { success: false, error: error.message }
    }
  }

  const handleCheckUserLike = async (postId) => {
    try {
      if (!session?.user?.id) return false
      return await checkUserLike(postId, session.user.id)
    } catch (error) {
      console.error('Error checking user like:', error)
      return false
    }
  }

  const handleAddComment = async (postId, commentData) => {
    try {
      if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to comment' }
      }
      return await addComment(postId, session.user.id, commentData.content, commentData.parentId)
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    ...data,
    subscribeNewsletter: handleSubscribeNewsletter,
    trackPostView: handleTrackPostView,
    likePost: handleLikePost,
    unlikePost: handleUnlikePost,
    checkUserLike: handleCheckUserLike,
    addComment: handleAddComment,
  }
}
