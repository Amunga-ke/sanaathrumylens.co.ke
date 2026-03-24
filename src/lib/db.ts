// src/lib/db.ts
// Database services using Prisma (replacing Firebase Firestore)

import { prisma } from './prisma'
import { Prisma, PostStatus, CommentStatus, EventStatus, Role } from '@prisma/client'
import { cache } from 'react'

// ==================== POSTS ====================

/**
 * Fetch published blog posts with pagination
 */
export const fetchBlogPosts = cache(async (count: number = 6, page: number = 1) => {
  try {
    const skip = (page - 1) * count

    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      },
      orderBy: { publishedAt: 'desc' },
      take: count,
      skip,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
})

/**
 * Fetch recent stories (most recent published posts)
 */
export const fetchRecentStories = cache(async (count: number = 4) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      },
      orderBy: { publishedAt: 'desc' },
      take: count,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching recent stories:', error)
    throw error
  }
})

/**
 * Fetch popular articles (most views)
 */
export const fetchPopularArticles = cache(async (count: number = 3) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      },
      orderBy: { viewCount: 'desc' },
      take: count,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching popular articles:', error)
    throw error
  }
})

/**
 * Fetch featured article
 */
export const fetchFeaturedArticle = cache(async () => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        status: PostStatus.PUBLISHED,
        isDeleted: false,
        featured: true,
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    if (!post) return null

    return {
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }
  } catch (error) {
    console.error('Error fetching featured article:', error)
    throw error
  }
})

/**
 * Fetch post by slug
 */
export const fetchPostBySlug = cache(async (slug: string) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ],
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      },
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true, bio: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!post) return null

    return {
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    throw error
  }
})

/**
 * Fetch complete article data including related content
 */
export const fetchCompleteArticleData = cache(async (slug: string) => {
  try {
    const post = await fetchPostBySlug(slug)

    if (!post) return null

    const [recentStories, categories, articlesByAuthor, relatedArticles] = await Promise.all([
      fetchRecentStories(4).then(stories =>
        stories.filter((story: any) => story.id !== post.id).slice(0, 4)
      ),
      fetchCategories(),
      post.author?.id ? fetchArticlesByAuthor(post.author.id, post.id, 4) : Promise.resolve([]),
      post.categoryId ? fetchRelatedArticles(post.categoryId, post.id, 4) : Promise.resolve([])
    ])

    return {
      post,
      recentStories,
      categories,
      articlesByAuthor,
      relatedArticles,
      viewCount: post.viewCount
    }
  } catch (error) {
    console.error('Error fetching complete article data:', error)
    throw error
  }
})

/**
 * Fetch articles by author ID
 */
export const fetchArticlesByAuthor = cache(async (authorId: string, excludePostId?: string, limitCount: number = 4) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId,
        status: PostStatus.PUBLISHED,
        isDeleted: false,
        NOT: excludePostId ? { id: excludePostId } : undefined
      },
      orderBy: { publishedAt: 'desc' },
      take: limitCount,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching articles by author:', error)
    throw error
  }
})

/**
 * Fetch related articles by category
 */
export const fetchRelatedArticles = cache(async (categoryId: string, excludePostId?: string, limitCount: number = 4) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        status: PostStatus.PUBLISHED,
        isDeleted: false,
        NOT: excludePostId ? { id: excludePostId } : undefined
      },
      orderBy: { publishedAt: 'desc' },
      take: limitCount,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching related articles:', error)
    throw error
  }
})

/**
 * Fetch posts by tag
 */
export const fetchPostsByTag = cache(async (tagName: string, limitCount: number = 20) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        isDeleted: false,
        tags: { contains: tagName }
      },
      orderBy: { publishedAt: 'desc' },
      take: limitCount,
      include: {
        author: {
          select: { id: true, name: true, slug: true, avatar: true }
        }
      }
    })

    return posts.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
      stats: {
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount
      }
    }))
  } catch (error) {
    console.error('Error fetching posts by tag:', error)
    throw error
  }
})

// ==================== CATEGORIES ====================

/**
 * Fetch all active categories
 */
export const fetchCategories = cache(async () => {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
})

// ==================== EVENTS ====================

/**
 * Fetch upcoming events
 */
export const fetchUpcomingEvents = cache(async (count: number = 4) => {
  try {
    const now = new Date()

    return await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        isDeleted: false,
        startDate: { gte: now }
      },
      orderBy: { startDate: 'asc' },
      take: count
    })
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw error
  }
})

// ==================== LIKES ====================

/**
 * Like a post
 */
export const likePost = async (postId: string, userId: string) => {
  try {
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    })

    if (existingLike) {
      return { success: false, message: 'You already liked this post' }
    }

    // Create like and update count
    await prisma.$transaction([
      prisma.like.create({
        data: { postId, userId }
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } }
      })
    ])

    return { success: true, message: 'Post liked successfully' }
  } catch (error) {
    console.error('Error liking post:', error)
    return { success: false, error: 'Failed to like post' }
  }
}

/**
 * Unlike a post
 */
export const unlikePost = async (postId: string, userId: string) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    })

    if (!existingLike) {
      return { success: false, message: 'You have not liked this post' }
    }

    await prisma.$transaction([
      prisma.like.delete({
        where: { postId_userId: { postId, userId } }
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } }
      })
    ])

    return { success: true, message: 'Post unliked successfully' }
  } catch (error) {
    console.error('Error unliking post:', error)
    return { success: false, error: 'Failed to unlike post' }
  }
}

/**
 * Check if user has liked a post
 */
export const checkUserLike = async (postId: string, userId: string) => {
  try {
    const like = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    })
    return !!like
  } catch (error) {
    console.error('Error checking user like:', error)
    return false
  }
}

// ==================== BOOKMARKS ====================

/**
 * Bookmark a post
 */
export const bookmarkPost = async (postId: string, userId: string) => {
  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    })

    if (existingBookmark) {
      return { success: false, message: 'Post already bookmarked' }
    }

    await prisma.bookmark.create({
      data: { postId, userId }
    })

    await prisma.user.update({
      where: { id: userId },
      data: { bookmarksCount: { increment: 1 } }
    })

    return { success: true, message: 'Post bookmarked successfully' }
  } catch (error) {
    console.error('Error bookmarking post:', error)
    return { success: false, error: 'Failed to bookmark post' }
  }
}

/**
 * Remove bookmark
 */
export const removeBookmark = async (postId: string, userId: string) => {
  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    })

    if (!existingBookmark) {
      return { success: false, message: 'Post not bookmarked' }
    }

    await prisma.bookmark.delete({
      where: { postId_userId: { postId, userId } }
    })

    await prisma.user.update({
      where: { id: userId },
      data: { bookmarksCount: { decrement: 1 } }
    })

    return { success: true, message: 'Bookmark removed successfully' }
  } catch (error) {
    console.error('Error removing bookmark:', error)
    return { success: false, error: 'Failed to remove bookmark' }
  }
}

/**
 * Toggle bookmark
 */
export const toggleBookmark = async (postId: string, userId: string) => {
  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    })

    if (existingBookmark) {
      await prisma.$transaction([
        prisma.bookmark.delete({
          where: { postId_userId: { postId, userId } }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { bookmarksCount: { decrement: 1 } }
        })
      ])
      return { success: true, bookmarked: false, message: 'Bookmark removed' }
    } else {
      await prisma.$transaction([
        prisma.bookmark.create({
          data: { postId, userId }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { bookmarksCount: { increment: 1 } }
        })
      ])
      return { success: true, bookmarked: true, message: 'Post bookmarked' }
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return { success: false, bookmarked: false, error: 'Failed to toggle bookmark' }
  }
}

/**
 * Check if user has bookmarked a post
 */
export const checkUserBookmark = async (postId: string, userId: string) => {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { postId_userId: { postId, userId } }
    })
    return !!bookmark
  } catch (error) {
    console.error('Error checking user bookmark:', error)
    return false
  }
}

/**
 * Fetch user bookmarks
 */
export const fetchUserBookmarks = async (userId: string, limitCount: number = 20) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limitCount,
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, slug: true, avatar: true }
            }
          }
        }
      }
    })

    return bookmarks
      .filter((b: any) => b.post && !b.post.isDeleted)
      .map((b: any) => ({
        bookmarkId: b.id,
        bookmarkedAt: b.createdAt,
        post: {
          ...b.post,
          tags: b.post.tags ? b.post.tags.split(',').filter(Boolean) : [],
          stats: {
            views: b.post.viewCount,
            likes: b.post.likeCount,
            comments: b.post.commentCount
          }
        }
      }))
  } catch (error) {
    console.error('Error fetching user bookmarks:', error)
    throw error
  }
}

// ==================== COMMENTS ====================

/**
 * Add a comment
 */
export const addComment = async (postId: string, userId: string, content: string, parentId?: string) => {
  try {
    if (!content || content.trim().length < 2) {
      return { success: false, message: 'Comment must be at least 2 characters' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true }
    })

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId,
        parentId: parentId || null
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    })

    await prisma.user.update({
      where: { id: userId },
      data: { commentsCount: { increment: 1 } }
    })

    return {
      success: true,
      commentId: comment.id,
      message: 'Comment added successfully',
      comment: {
        ...comment,
        user: { name: user?.name || 'Anonymous', image: user?.image }
      }
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}

/**
 * Fetch comments for a post
 */
export const fetchComments = cache(async (postId: string, limitCount: number = 50) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        status: CommentStatus.VISIBLE,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      take: limitCount,
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        replies: {
          where: {
            status: CommentStatus.VISIBLE,
            isDeleted: false
          },
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
})

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string, userId: string) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: { select: { id: true } } }
    })

    if (!comment) {
      return { success: false, message: 'Comment not found' }
    }

    // Check if user owns the comment or is admin/moderator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    const canDelete = comment.userId === userId ||
      ['ADMIN', 'MODERATOR', 'EDITOR'].includes(user?.role || '')

    if (!canDelete) {
      return { success: false, message: 'You cannot delete this comment' }
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: CommentStatus.HIDDEN
      }
    })

    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } }
    })

    return { success: true, message: 'Comment deleted' }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}

/**
 * Like a comment
 */
export const likeComment = async (commentId: string, userId: string) => {
  try {
    const existingLike = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } }
    })

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: { commentId_userId: { commentId, userId } }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } }
        })
      ])
      return { success: true, liked: false }
    } else {
      // Like
      await prisma.$transaction([
        prisma.commentLike.create({
          data: { commentId, userId }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } }
        })
      ])
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error liking comment:', error)
    return { success: false, error: 'Failed to like comment' }
  }
}

/**
 * Report a comment
 */
export const reportComment = async (commentId: string, reporterId: string, reason?: string) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return { success: false, error: 'Comment does not exist' }
    }

    if (comment.userId === reporterId) {
      return { success: false, error: 'You cannot report your own comment' }
    }

    const existingReport = await prisma.commentReport.findUnique({
      where: { commentId_reporterId: { commentId, reporterId } }
    })

    if (existingReport) {
      return { success: false, error: 'You have already reported this comment' }
    }

    await prisma.commentReport.create({
      data: { commentId, reporterId, reason }
    })

    return { success: true, message: 'Comment reported successfully' }
  } catch (error) {
    console.error('Error reporting comment:', error)
    return { success: false, error: 'Failed to report comment' }
  }
}

// ==================== NEWSLETTER ====================

/**
 * Subscribe to newsletter
 */
export const subscribeToNewsletter = async (email: string) => {
  try {
    const existing = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (existing && existing.isActive) {
      return { success: false, message: 'Email already subscribed' }
    }

    if (existing && !existing.isActive) {
      await prisma.subscriber.update({
        where: { email },
        data: { isActive: true, subscribedAt: new Date() }
      })
      return { success: true, message: 'Successfully resubscribed!' }
    }

    await prisma.subscriber.create({
      data: { email }
    })

    return { success: true, message: 'Successfully subscribed!' }
  } catch (error) {
    console.error('Error subscribing:', error)
    return { success: false, message: 'Subscription failed. Please try again.' }
  }
}

// ==================== VIEW TRACKING ====================

/**
 * Track post view
 */
export const trackPostView = async (postId: string, userId?: string, ipAddress?: string, userAgent?: string) => {
  try {
    await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } }
      }),
      prisma.postView.create({
        data: {
          postId,
          userId,
          ipAddress,
          userAgent
        }
      })
    ])

    return { success: true }
  } catch (error) {
    console.error('Error tracking view:', error)
    return { success: false }
  }
}

// ==================== AUTHORS ====================

/**
 * Fetch author by slug
 */
export const fetchAuthorBySlug = cache(async (slug: string) => {
  try {
    return await prisma.author.findUnique({
      where: { slug },
      include: {
        posts: {
          where: {
            status: PostStatus.PUBLISHED,
            isDeleted: false
          },
          orderBy: { publishedAt: 'desc' },
          take: 10
        }
      }
    })
  } catch (error) {
    console.error('Error fetching author:', error)
    throw error
  }
})

// ==================== USER ====================

/**
 * Get user by ID
 */
export const getUserById = cache(async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        website: true,
        bookmarksCount: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
        lastLoginAt: true
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
})

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: { name?: string; bio?: string; website?: string; image?: string }) => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Update editor profile (with social links)
 */
export const updateEditorProfile = async (userId: string, data: {
  name?: string
  bio?: string
  website?: string
  image?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  facebook?: string
}) => {
  try {
    // Update user profile
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        profileCompleted: true,
        profileReminderDismissed: false
      }
    })

    // If user has author profile, update that too
    if (user.role === 'EDITOR' || user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'SUPER_ADMIN') {
      const existingAuthor = await prisma.author.findUnique({
        where: { userId }
      })

      if (existingAuthor) {
        await prisma.author.update({
          where: { userId },
          data: {
            name: data.name || existingAuthor.name,
            bio: data.bio || existingAuthor.bio,
            avatar: data.image || existingAuthor.avatar,
            website: data.website || existingAuthor.website,
            twitter: data.twitter || existingAuthor.twitter,
            instagram: data.instagram || existingAuthor.instagram,
            linkedin: data.linkedin || existingAuthor.linkedin,
            facebook: data.facebook || existingAuthor.facebook
          }
        })
      }
    }

    return user
  } catch (error) {
    console.error('Error updating editor profile:', error)
    throw error
  }
}

/**
 * Check if user profile is complete (for editors/admins/moderators)
 */
export const checkProfileCompletion = async (userId: string): Promise<{
  isComplete: boolean
  missingFields: string[]
  requiredFields: string[]
}> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        name: true,
        bio: true,
        image: true,
        profileCompleted: true
      }
    })

    if (!user) {
      return { isComplete: false, missingFields: ['User not found'], requiredFields: [] }
    }

    // Only editors/admins/moderators need to complete profile
    const needsProfile = ['EDITOR', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN'].includes(user.role)
    
    if (!needsProfile) {
      return { isComplete: true, missingFields: [], requiredFields: [] }
    }

    const requiredFields = ['name', 'bio', 'image']
    const missingFields: string[] = []

    if (!user.name || user.name.trim() === '') missingFields.push('name')
    if (!user.bio || user.bio.trim() === '') missingFields.push('bio')
    if (!user.image) missingFields.push('profile image')

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      requiredFields
    }
  } catch (error) {
    console.error('Error checking profile completion:', error)
    throw error
  }
}

/**
 * Elevate user role (admin action)
 */
export const elevateUserRole = async (
  targetUserId: string, 
  newRole: 'EDITOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN',
  adminId: string
) => {
  try {
    // Verify admin has permission
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    })

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return { success: false, message: 'Insufficient permissions' }
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!targetUser) {
      return { success: false, message: 'User not found' }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole as any,
        roleElevatedAt: new Date(),
        profileCompleted: false,
        profileReminderDismissed: false
      }
    })

    // Create author profile if doesn't exist
    const existingAuthor = await prisma.author.findUnique({
      where: { userId: targetUserId }
    })

    if (!existingAuthor) {
      // Generate slug from name or email
      const baseSlug = targetUser.name?.toLowerCase().replace(/\s+/g, '-') || targetUser.email.split('@')[0]
      let slug = baseSlug
      let counter = 1

      // Ensure unique slug
      while (await prisma.author.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      await prisma.author.create({
        data: {
          name: targetUser.name || targetUser.email.split('@')[0],
          slug,
          userId: targetUserId,
          isPublic: true
        }
      })
    }

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error elevating user role:', error)
    return { success: false, message: 'Failed to elevate user role' }
  }
}

/**
 * Dismiss profile completion reminder
 */
export const dismissProfileReminder = async (userId: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { profileReminderDismissed: true }
    })
    return { success: true }
  } catch (error) {
    console.error('Error dismissing profile reminder:', error)
    return { success: false }
  }
}

/**
 * Get users by role
 */
export const getUsersByRole = cache(async (role: string) => {
  try {
    return await prisma.user.findMany({
      where: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        website: true,
        twitter: true,
        instagram: true,
        linkedin: true,
        facebook: true,
        profileCompleted: true,
        roleElevatedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw error
  }
})

// ==================== ALIASES FOR API ROUTES ====================

/**
 * Get posts with filters (alias for API routes)
 */
export const getPosts = async (options: {
  limit?: number
  categoryId?: string
  authorId?: string
  tag?: string
} = {}) => {
  const { limit = 10, categoryId, authorId, tag } = options

  const where: any = {
    status: PostStatus.PUBLISHED,
    isDeleted: false
  }

  if (categoryId) where.categoryId = categoryId
  if (authorId) where.authorId = authorId
  if (tag) where.tags = { contains: tag }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      author: {
        select: { id: true, name: true, slug: true, avatar: true }
      },
      category: {
        select: { id: true, name: true, slug: true }
      }
    }
  })

  return posts.map((post: any) => ({
    ...post,
    tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
    stats: {
      views: post.viewCount,
      likes: post.likeCount,
      comments: post.commentCount
    }
  }))
}

/**
 * Get comments (alias for API routes)
 */
export const getComments = fetchComments

/**
 * Create comment (alias for API routes)
 */
export const createComment = async (postId: string, userId: string, content: string, parentId?: string) => {
  const result = await addComment(postId, userId, content, parentId)
  return result.success ? result.comment : null
}

/**
 * Check if user liked (alias for API routes)
 */
export const checkUserLiked = checkUserLike

// ==================== ADDITIONAL ALIASES FOR LEGACY CODE ====================

// Export Prisma enums for use in other files
export { PostStatus, CommentStatus, EventStatus, Role }

// Author aliases
export const getAuthorBySlug = fetchAuthorBySlug
export const getAuthors = cache(async () => {
  try {
    return await prisma.author.findMany({
      where: { isPublic: true },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching authors:', error)
    throw error
  }
})

// Post aliases
export const getPostBySlug = fetchPostBySlug
export const getRecentPosts = fetchRecentStories
export const getPostsByAuthor = fetchArticlesByAuthor
export const getRelatedPosts = fetchRelatedArticles
export const getPopularPosts = fetchPopularArticles
export const getFeaturedPost = fetchFeaturedArticle

// Category aliases
export const getCategories = fetchCategories

// Event aliases
export const getEvents = cache(async (options: { limit?: number; status?: typeof EventStatus.PUBLISHED } = {}) => {
  try {
    const { limit = 10 } = options
    const now = new Date()

    return await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        isDeleted: false,
        startDate: { gte: now }
      },
      orderBy: { startDate: 'asc' },
      take: limit
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
})

export const getEventBySlug = cache(async (slug: string) => {
  try {
    return await prisma.event.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: EventStatus.PUBLISHED,
        isDeleted: false
      }
    })
  } catch (error) {
    console.error('Error fetching event by slug:', error)
    throw error
  }
})

export const getUpcomingEvents = fetchUpcomingEvents

// Tag aliases
export const getPostsByTag = fetchPostsByTag

// View tracking alias
export const incrementPostView = trackPostView

// Comment update function
export const updateComment = async (commentId: string, userId: string, newContent: string) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return { success: false, message: 'Comment not found' }
    }

    if (comment.userId !== userId) {
      return { success: false, message: 'You cannot edit this comment' }
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: newContent.trim(),
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return { success: true, comment: updated }
  } catch (error) {
    console.error('Error updating comment:', error)
    return { success: false, error: 'Failed to update comment' }
  }
}
