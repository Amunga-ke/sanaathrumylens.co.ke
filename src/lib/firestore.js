// src/lib/firestore.js
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, Timestamp, setDoc, updateDoc, increment, addDoc, deleteDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db, auth } from './firebase';

// Lightweight client-side in-memory cache to reduce duplicate reads during a session.
const _clientCache = new Map();

async function cachedClient(key, ttlMs, fetcher) {
    const now = Date.now();
    const entry = _clientCache.get(key);
    if (entry && entry.expires > now) return entry.value;
    const value = await fetcher();
    try { _clientCache.set(key, { value, expires: now + ttlMs }); } catch (e) { }
    return value;
}

// Helper to convert Firestore Timestamp to ISO string
const toSerializable = (data) => {
    if (Array.isArray(data)) {
        return data.map(toSerializable);
    }
    if (data && typeof data === 'object' && !(data instanceof Date)) {
        // Handle Firestore Timestamps
        if (data.seconds !== undefined && data.nanoseconds !== undefined) {
            return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString();
        }

        // Handle nested objects
        const result = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result[key] = toSerializable(data[key]);
            }
        }
        return result;
    }
    return data;
};

/**
 * Fetch upcoming events (published, future dates)
 */
export const fetchUpcomingEvents = async (count = 4) => {
    try {
        const now = Timestamp.now();

        const eventsRef = collection(db, 'events');
        const q = query(
            eventsRef,
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            where('startDate', '>=', now),
            orderBy('startDate', 'asc'),
            limit(count)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => toSerializable({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate,
            endDate: doc.data().endDate,
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

/**
 * Fetch published blog posts (using pre-aggregated stats)
 */
export const fetchBlogPosts = async (count = 6) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            orderBy('publishedAt', 'desc'),
            limit(count)
        );

        const snapshot = await getDocs(q);

        const postsWithAuthors = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();

                // Fetch author details if needed
                let authorData = null;
                if (postData.authorId && !postData.authorSnapshot) {
                    try {
                        const authorDoc = await getDoc(doc(db, 'authors', postData.authorId));
                        if (authorDoc.exists()) {
                            authorData = authorDoc.data();
                        }
                    } catch (err) {
                        console.error('Error fetching author:', err);
                    }
                }

                return toSerializable({
                    id: docSnapshot.id,
                    ...postData,
                    author: authorData || postData.authorSnapshot,
                    publishedAt: postData.publishedAt,
                    createdAt: postData.createdAt,
                    stats: {
                        views: postData.stats?.views || 0,
                        likes: postData.stats?.likes || 0,
                        comments: postData.stats?.comments || 0,
                        updatedAt: postData.stats?.updatedAt,
                    }
                });
            })
        );

        return postsWithAuthors;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
    }
};

/**
 * Fetch recent stories (most recent published posts)
 */
export const fetchRecentStories = async (count = 4) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            orderBy('publishedAt', 'desc'),
            limit(count)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => toSerializable({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt,
            createdAt: doc.data().createdAt,
            stats: {
                views: doc.data().stats?.views || 0,
                likes: doc.data().stats?.likes || 0,
                comments: doc.data().stats?.comments || 0,
                updatedAt: doc.data().stats?.updatedAt,
            }
        }));
    } catch (error) {
        console.error('Error fetching recent stories:', error);
        throw error;
    }
};

/**
 * Fetch popular articles (most views)
 */
export const fetchPopularArticles = async (count = 3) => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            orderBy('stats.views', 'desc'),
            limit(count)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => toSerializable({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt,
            stats: {
                views: doc.data().stats?.views || 0,
                likes: doc.data().stats?.likes || 0,
                comments: doc.data().stats?.comments || 0,
                updatedAt: doc.data().stats?.updatedAt,
            }
        }));
    } catch (error) {
        console.error('Error fetching popular articles:', error);
        throw error;
    }
};

/**
 * Fetch featured article
 */
export const fetchFeaturedArticle = async () => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            where('featured', '==', true),
            orderBy('publishedAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        const docData = snapshot.docs[0];
        return toSerializable({
            id: docData.id,
            ...docData.data(),
            publishedAt: docData.data().publishedAt,
            stats: {
                views: docData.data().stats?.views || 0,
                likes: docData.data().stats?.likes || 0,
                comments: docData.data().stats?.comments || 0,
                updatedAt: docData.data().stats?.updatedAt,
            }
        });
    } catch (error) {
        console.error('Error fetching featured article:', error);
        throw error;
    }
};

/**
 * Fetch categories
 */
export const fetchCategories = async () => {
    try {
        const categoriesRef = collection(db, 'categories');
        const q = query(
            categoriesRef,
            where('isActive', '==', true),
            orderBy('name')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Subscribe to newsletter
 */
export const subscribeToNewsletter = async (email) => {
    try {
        // Check if email already exists
        const subscribersRef = collection(db, 'subscribers');
        const q = query(
            subscribersRef,
            where('email', '==', email),
            where('isActive', '==', true)
        );

        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, message: 'Email already subscribed' };
        }

        // Add new subscriber
        await addDoc(subscribersRef, {
            email,
            subscribedAt: serverTimestamp(),
            isActive: true,
        });

        return { success: true, message: 'Successfully subscribed!' };
    } catch (error) {
        console.error('Error subscribing:', error);
        return { success: false, message: 'Subscription failed. Please try again.' };
    }
};

/**
 * Track post view (increment views count)
 */
export const trackPostView = async (postId) => {
    if (!postId) return;

    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            'stats.views': increment(1),
        });
    } catch (error) {
        console.error('View tracking failed:', error);
    }
};

/**
 * Like a post (with aggregated stats)
 */
export const likePost = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in to like posts' };
        }

        const userId = user.uid;

        // Check if user already liked this post
        const likeRef = doc(db, 'posts', postId, 'likes', userId);
        const likeDoc = await getDoc(likeRef);

        if (likeDoc.exists() && !likeDoc.data().isDeleted) {
            return { success: false, message: 'You already liked this post' };
        }

        // Add/update like in subcollection
        await setDoc(likeRef, {
            userId: userId,
            likedAt: serverTimestamp(),
            isDeleted: false,
            deletedAt: null,
        }, { merge: true });

        // Increment likes count in post stats
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            'stats.likes': increment(1),
            'stats.updatedAt': serverTimestamp(),
        });

        return { success: true, message: 'Post liked successfully' };
    } catch (error) {
        console.error('Error liking post:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Unlike a post (with aggregated stats)
 */
export const unlikePost = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in to unlike posts' };
        }

        const userId = user.uid;

        // Check if user liked this post
        const likeRef = doc(db, 'posts', postId, 'likes', userId);
        const likeDoc = await getDoc(likeRef);

        if (!likeDoc.exists() || likeDoc.data().isDeleted) {
            return { success: false, message: 'You have not liked this post' };
        }

        // Mark like as deleted
        await updateDoc(likeRef, {
            isDeleted: true,
            deletedAt: serverTimestamp(),
        });

        // Decrement likes count in post stats
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            'stats.likes': increment(-1),
            'stats.updatedAt': serverTimestamp(),
        });

        return { success: true, message: 'Post unliked successfully' };
    } catch (error) {
        console.error('Error unliking post:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if current user has liked a post
 */
export const checkUserLike = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const userId = user.uid;
        const likeRef = doc(db, 'posts', postId, 'likes', userId);
        const likeDoc = await getDoc(likeRef);

        return likeDoc.exists() && !likeDoc.data().isDeleted;
    } catch (error) {
        console.error('Error checking user like:', error);
        return false;
    }
};

/**
 * Add comment to a post (with aggregated stats)
 */
export const addComment = async (postId, commentData) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in to comment' };
        }

        const { content, parentId = null } = commentData;

        if (!content || content.trim().length < 2) {
            return { success: false, message: 'Comment must be at least 2 characters' };
        }

        // Add comment to subcollection
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const newCommentRef = await addDoc(commentsRef, {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: user.photoURL || '',
            content: content.trim(),
            parentId: parentId,
            status: 'visible',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isEdited: false,
            editedAt: null,
            isDeleted: false,
            deletedAt: null,
        });

        // Increment comments count in post stats
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            'stats.comments': increment(1),
            'stats.updatedAt': serverTimestamp(),
        });

        return {
            success: true,
            commentId: newCommentRef.id,
            message: 'Comment added successfully'
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch comments for a post
 */
export const fetchComments = async (postId, limitCount = 50, userId = null) => {
    try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(
            commentsRef,
            where('status', '==', 'visible'),
            where('isDeleted', '==', false),
            where('parentId', '==', null),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);

        // Transform comments and fetch like and report status for each comment
        const commentsWithStatus = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
                const commentData = toSerializable({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                    createdAt: docSnapshot.data().createdAt,
                    updatedAt: docSnapshot.data().updatedAt,
                });

                // If user is logged in, check if they liked or reported this comment
                if (userId) {
                    try {
                        // Check like status
                        const likeRef = doc(db, `posts/${postId}/comments/${docSnapshot.id}/likes/user_${userId}`);
                        const likeSnap = await getDoc(likeRef);
                        commentData.likedByUser = likeSnap.exists();

                        // Check report status
                        const reportRef = doc(db, `posts/${postId}/comments/${docSnapshot.id}/reports/${userId}`);
                        const reportSnap = await getDoc(reportRef);
                        commentData.reportedByUser = reportSnap.exists();
                    } catch (error) {
                        console.error('Error checking status:', error);
                        commentData.likedByUser = false;
                        commentData.reportedByUser = false;
                    }
                } else {
                    commentData.likedByUser = false;
                    commentData.reportedByUser = false;
                }

                return commentData;
            })
        );

        return commentsWithStatus;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

/**
 * Fetch replies for a comment
 */
export const fetchReplies = async (postId, commentId) => {
    try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(
            commentsRef,
            where('status', '==', 'visible'),
            where('isDeleted', '==', false),
            where('parentId', '==', commentId),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => toSerializable({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
        }));
    } catch (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }
};

/**
 * Generate a hash for view tracking
 */
export const generateViewHash = (postId, userId, userAgent) => {
    // Generate a unique hash based on post, user, and hour of day
    const now = new Date();
    const hour = now.getHours();
    const date = now.toDateString();

    const str = `${postId}_${userId}_${date}_${hour}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

/**
 * Get view tracking status
 */
export const getViewTrackingStatus = (postId) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'anonymous';

    const storageKey = userId === 'anonymous'
        ? `view_${postId}`
        : `view_${postId}_${userId}`;

    const lastView = localStorage.getItem(storageKey);

    if (!lastView) {
        return {
            canView: true,
            lastViewTime: null,
            cooldownRemaining: 0,
            nextViewAt: null
        };
    }

    const lastViewTime = parseInt(lastView);
    const now = Date.now();
    const cooldownMs = userId === 'anonymous' ? 3600000 : 300000;
    const timeSinceLastView = now - lastViewTime;
    const cooldownRemaining = Math.max(0, cooldownMs - timeSinceLastView);

    return {
        canView: cooldownRemaining === 0,
        lastViewTime,
        cooldownRemaining,
        nextViewAt: lastViewTime + cooldownMs
    };
};

/**
 * Enhanced fetchPostBySlug with view count
 */
export const fetchPostBySlug = async (slug) => {
    const key = `post:${slug}`;
    return cachedClient(key, 60 * 1000, async () => {
        try {
            let postDoc;
            let postId = slug;

            // Handle both slug and direct ID access
            if (slug.length !== 20) {
                const postsQuery = query(
                    collection(db, "posts"),
                    where("slug", "==", slug),
                    where("status", "==", "published"),
                    where("isDeleted", "==", false),
                    limit(1)
                );
                const snapshot = await getDocs(postsQuery);
                if (!snapshot.empty) {
                    postDoc = snapshot.docs[0];
                    postId = postDoc.id;
                }
            } else {
                postDoc = await getDoc(doc(db, "posts", slug));
            }

            if (!postDoc?.exists()) {
                throw new Error("Post not found");
            }

            const postData = postDoc.data();

            // Fetch author data
            let authorData = null;
            if (postData.authorId) {
                try {
                    const authorDoc = await getDoc(doc(db, "authors", postData.authorId));
                    if (authorDoc.exists()) {
                        authorData = toSerializable({
                            id: authorDoc.id,
                            ...authorDoc.data(),
                            createdAt: authorDoc.data().createdAt,
                            updatedAt: authorDoc.data().updatedAt,
                        });
                    }
                } catch (authorError) {
                    console.error("Error fetching author:", authorError);
                }
            }

            return toSerializable({
                id: postId,
                ...postData,
                publishedAt: postData.publishedAt,
                createdAt: postData.createdAt,
                author: authorData || postData.authorSnapshot,
                stats: {
                    views: postData.stats?.views || 0,
                    likes: postData.stats?.likes || 0,
                    comments: postData.stats?.comments || 0,
                    updatedAt: postData.stats?.updatedAt,
                }
            });
        } catch (error) {
            console.error('Error fetching post by slug:', error);
            throw error;
        }
    });
};

/**
 * Fetch articles by author ID
 */
export const fetchArticlesByAuthor = async (authorId, excludePostId = null, limitCount = 4) => {
    try {
        const authorQuery = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            where("isDeleted", "==", false),
            where("authorId", "==", authorId),
            orderBy("publishedAt", "desc"),
            limit(limitCount)
        );

        const authorSnapshot = await getDocs(authorQuery);
        const authorPosts = authorSnapshot.docs
            .map((doc) => toSerializable({
                id: doc.id,
                ...doc.data(),
                publishedAt: doc.data().publishedAt,
            }))
            .filter((p) => p.id !== excludePostId);

        return authorPosts;
    } catch (error) {
        console.error('Error fetching articles by author:', error);
        throw error;
    }
};

/**
 * Fetch related articles by category IDs
 */
export const fetchRelatedArticles = async (categoryIds, excludePostId = null, limitCount = 4) => {
    try {
        if (!categoryIds?.length) return [];

        const relatedQuery = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            where("isDeleted", "==", false),
            where(
                "categoryIds",
                "array-contains-any",
                categoryIds.slice(0, 2)
            ),
            orderBy("publishedAt", "desc"),
            limit(limitCount)
        );

        const relatedSnapshot = await getDocs(relatedQuery);
        const related = relatedSnapshot.docs
            .map((doc) => toSerializable({
                id: doc.id,
                ...doc.data(),
                publishedAt: doc.data().publishedAt,
            }))
            .filter((p) => p.id !== excludePostId)
            .slice(0, 3);

        return related;
    } catch (error) {
        console.error('Error fetching related articles:', error);
        throw error;
    }
};

/**
 * Fetch complete article data including related content
 */
export const fetchCompleteArticleData = async (slug) => {
    const key = `completeArticle:${slug}`;
    return cachedClient(key, 20 * 1000, async () => {
        try {
            const post = await fetchPostBySlug(slug);

            if (!post) return null;

            const [
                recentStories,
                categories,
                articlesByAuthor,
                relatedArticles
            ] = await Promise.all([
                fetchRecentStories(4).then(stories =>
                    stories.filter(story => story.id !== post.id).slice(0, 4)
                ),
                fetchCategories(),
                post.author?.id ? fetchArticlesByAuthor(post.author.id, post.id, 4) : Promise.resolve([]),
                post.categoryIds?.length ? fetchRelatedArticles(post.categoryIds, post.id, 4) : Promise.resolve([])
            ]);

            return {
                post,
                recentStories,
                categories,
                articlesByAuthor,
                relatedArticles,
                viewCount: post.stats?.views || 0
            };
        } catch (error) {
            console.error('Error fetching complete article data:', error);
            throw error;
        }
    });
};

/**
 * Delete comment
 */
export const deleteComment = async (postId, commentId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in' };
        }

        const commentRef = doc(db, 'posts', postId, 'comments', commentId);
        const commentDoc = await getDoc(commentRef);

        if (!commentDoc.exists()) {
            return { success: false, message: 'Comment not found' };
        }

        const commentData = commentDoc.data();

        // Check if user owns the comment or is a moderator/admin
        if (commentData.userId !== user.uid) {
            // Check user role from users collection
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            const userRoles = userData?.roles || [];

            const canModerate = userRoles.some(role =>
                ['admin', 'editor', 'moderator'].includes(role)
            );

            if (!canModerate) {
                return { success: false, message: 'You cannot delete this comment' };
            }
        }

        // Soft delete the comment
        await updateDoc(commentRef, {
            isDeleted: true,
            deletedAt: serverTimestamp(),
            status: 'hidden'
        });

        // Decrement comments count in post stats
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            'stats.comments': increment(-1),
            'stats.updatedAt': serverTimestamp(),
        });

        return { success: true, message: 'Comment deleted' };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Like a comment (authenticated users only) - UPDATED SIGNATURE
 */
export const likeComment = async (postId, commentId, userData) => {
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const likeId = 'user_' + userData.userId;
    const likeRef = doc(db, `posts/${postId}/comments/${commentId}/likes/${likeId}`);

    try {
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) {
                throw new Error('Comment does not exist');
            }

            const likeSnap = await transaction.get(likeRef);
            const currentLikes = commentDoc.data().likes || 0;

            if (likeSnap.exists()) {
                // User is unliking: delete the like document and decrement the count
                transaction.delete(likeRef);
                transaction.update(commentRef, {
                    likes: Math.max(0, currentLikes - 1)
                });
            } else {
                // User is liking: create the like document and increment the count
                transaction.set(likeRef, {
                    userId: userData.userId,        // Flattened
                    userName: userData.userName,    // Flattened
                    userAvatar: userData.userAvatar, // Flattened
                    likedAt: serverTimestamp(),
                });
                transaction.update(commentRef, {
                    likes: currentLikes + 1
                });
            }
        });

        // We need to determine if the final action was a 'like' or 'unlike' for the return value
        const finalLikeSnap = await getDoc(likeRef);
        const liked = finalLikeSnap.exists();

        return { success: true, liked: liked };
    } catch (error) {
        console.error('Error in likeComment transaction:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Report a comment
 */
export const reportComment = async (postId, commentId, reporterId) => {
    try {
        console.log('Starting report process...');
        console.log('postId:', postId);
        console.log('commentId:', commentId);
        console.log('reporterId:', reporterId);

        const commentRef = doc(db, 'posts', postId, 'comments', commentId);
        const commentSnap = await getDoc(commentRef);

        console.log('Comment exists:', commentSnap.exists());

        if (!commentSnap.exists()) {
            return { success: false, error: 'Comment does not exist' };
        }

        const commentData = commentSnap.data();
        console.log('Comment userId:', commentData.userId);

        if (commentData.userId === reporterId) {
            return { success: false, error: "You cannot report your own comment" };
        }

        const reportRef = doc(db, 'posts', postId, 'comments', commentId, 'reports', reporterId);
        console.log('Report ref path:', reportRef.path);

        const reportSnap = await getDoc(reportRef);
        console.log('Report already exists:', reportSnap.exists());

        if (reportSnap.exists()) {
            return { success: false, error: 'You have already reported this comment' };
        }

        // Create the report document
        const reportData = {
            reporterId,
            reportedUserId: commentData.userId,
            reportedAt: serverTimestamp(),
            status: 'pending',
        };

        console.log('Report data to be sent:', JSON.stringify(reportData, null, 2));

        await setDoc(reportRef, reportData);

        console.log('Report created successfully');
        return { success: true, message: 'Comment reported successfully' };
    } catch (error) {
        console.error('=== FULL ERROR DETAILS ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Stack trace:', error.stack);
        return { success: false, error: 'Failed to report comment' };
    }
};

/**
 * Update a comment
 */
export const updateComment = async (postId, commentId, newContent) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in' };
        }

        const commentRef = doc(db, 'posts', postId, 'comments', commentId);
        const commentDoc = await getDoc(commentRef);

        if (!commentDoc.exists()) {
            return { success: false, message: 'Comment not found' };
        }

        const commentData = commentDoc.data();

        // Check if user owns the comment
        if (commentData.userId !== user.uid) {
            return { success: false, message: 'You cannot edit this comment' };
        }

        // Update the comment
        await updateDoc(commentRef, {
            content: newContent.trim(),
            isEdited: true,
            editedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true, message: 'Comment updated' };
    } catch (error) {
        console.error('Error updating comment:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Bookmark a post for the current user
 */
export const bookmarkPost = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in to bookmark posts' };
        }

        const userId = user.uid;
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);

        // Check if already bookmarked
        const bookmarkDoc = await getDoc(bookmarkRef);
        if (bookmarkDoc.exists()) {
            return { success: false, message: 'Post already bookmarked' };
        }

        // Add bookmark
        await setDoc(bookmarkRef, {
            postId: postId,
            bookmarkedAt: serverTimestamp(),
            userId: userId,
        });

        return { success: true, message: 'Post bookmarked successfully' };
    } catch (error) {
        console.error('Error bookmarking post:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Remove bookmark for the current user
 */
export const removeBookmark = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, message: 'You must be logged in to remove bookmarks' };
        }

        const userId = user.uid;
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);

        // Check if bookmark exists
        const bookmarkDoc = await getDoc(bookmarkRef);
        if (!bookmarkDoc.exists()) {
            return { success: false, message: 'Post not bookmarked' };
        }

        // Remove bookmark
        await deleteDoc(bookmarkRef);

        return { success: true, message: 'Bookmark removed successfully' };
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if current user has bookmarked a post
 */
export const checkUserBookmark = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const userId = user.uid;
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
        const bookmarkDoc = await getDoc(bookmarkRef);

        return bookmarkDoc.exists();
    } catch (error) {
        console.error('Error checking user bookmark:', error);
        return false;
    }
};

/**
 * Fetch all bookmarks for current user
 */
export const fetchUserBookmarks = async (limitCount = 20) => {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const userId = user.uid;
        const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
        const q = query(
            bookmarksRef,
            orderBy('bookmarkedAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const bookmarkData = snapshot.docs.map(doc => toSerializable({
            bookmarkId: doc.id,
            ...doc.data(),
            bookmarkedAt: doc.data().bookmarkedAt,
        }));

        // Fetch full post data for each bookmark
        const postsWithData = await Promise.all(
            bookmarkData.map(async (bookmark) => {
                try {
                    const postDoc = await getDoc(doc(db, 'posts', bookmark.postId));
                    if (!postDoc.exists()) return null;

                    const postData = postDoc.data();

                    // Fetch author data
                    let authorData = null;
                    if (postData.authorId) {
                        try {
                            const authorDoc = await getDoc(doc(db, 'authors', postData.authorId));
                            if (authorDoc.exists()) {
                                authorData = toSerializable({
                                    id: authorDoc.id,
                                    ...authorDoc.data(),
                                });
                            }
                        } catch (authorError) {
                            console.error('Error fetching author:', authorError);
                        }
                    }

                    return toSerializable({
                        ...bookmark,
                        post: {
                            id: postDoc.id,
                            ...postData,
                            publishedAt: postData.publishedAt,
                            author: authorData || postData.authorSnapshot,
                        }
                    });
                } catch (error) {
                    console.error(`Error fetching post ${bookmark.postId}:`, error);
                    return null;
                }
            })
        );

        return postsWithData.filter(item => item !== null);
    } catch (error) {
        console.error('Error fetching user bookmarks:', error);
        throw error;
    }
};

/**
 * Toggle bookmark - adds if not bookmarked, removes if bookmarked
 */
export const toggleBookmark = async (postId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return {
                success: false,
                message: 'You must be logged in to bookmark posts',
                bookmarked: false
            };
        }

        const userId = user.uid;
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
        const bookmarkDoc = await getDoc(bookmarkRef);

        if (bookmarkDoc.exists()) {
            // Remove bookmark
            await runTransaction(db, async (transaction) => {
                transaction.delete(bookmarkRef);
            });
            return {
                success: true,
                message: 'Bookmark removed',
                bookmarked: false
            };
        } else {
            // Add bookmark
            await runTransaction(db, async (transaction) => {
                transaction.set(bookmarkRef, {
                    postId: postId,
                    bookmarkedAt: serverTimestamp(),
                    userId: userId,
                });
            });
            return {
                success: true,
                message: 'Post bookmarked',
                bookmarked: true
            };
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return {
            success: false,
            error: error.message,
            bookmarked: false
        };
    }
};

/**
 * Fetch posts by tag
 */
export const fetchPostsByTag = async (tagSlug, limitCount = 20) => {
    try {
        // Decode URL component if needed
        const tagName = decodeURIComponent(tagSlug);

        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('tags', 'array-contains', tagName),
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            orderBy('publishedAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);

        const postsWithAuthors = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
                const postData = docSnapshot.data();

                // Fetch author details if needed
                let authorData = null;
                if (postData.authorId && !postData.authorSnapshot) {
                    try {
                        const authorDoc = await getDoc(doc(db, 'authors', postData.authorId));
                        if (authorDoc.exists()) {
                            authorData = toSerializable(authorDoc.data());
                        }
                    } catch (err) {
                        console.error('Error fetching author:', err);
                    }
                }

                return toSerializable({
                    id: docSnapshot.id,
                    ...postData,
                    author: authorData || postData.authorSnapshot,
                    publishedAt: postData.publishedAt,
                    createdAt: postData.createdAt,
                    stats: {
                        views: postData.stats?.views || 0,
                        likes: postData.stats?.likes || 0,
                        comments: postData.stats?.comments || 0,
                        updatedAt: postData.stats?.updatedAt,
                    }
                });
            })
        );

        return postsWithAuthors;
    } catch (error) {
        console.error('Error fetching posts by tag:', error);
        throw error;
    }
};

/**
 * Convert string date to Date object for client-side use
 */
export const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
        return new Date(dateString);
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
};

/**
 * Fetch posts with pagination for server-side rendering
 */
export const fetchPostsWithPagination = async (options = {}) => {
    const {
        limit = 12,
        offset = 0,
        search = '',
        category = '',
        orderByField = 'publishedAt',
        orderDirection = 'desc'
    } = options;

    try {
        let q = query(
            collection(db, 'posts'),
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            orderBy(orderByField, orderDirection)
        );

        const snapshot = await getDocs(q);

        let posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...toSerializable(doc.data()),
            publishedAt: doc.data().publishedAt,
        }));

        // Apply filters
        if (search) {
            posts = posts.filter(post =>
                post.title?.toLowerCase().includes(search.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category) {
            posts = posts.filter(post =>
                post.category === category ||
                post.categoryIds?.includes(category)
            );
        }

        // Apply pagination
        const paginatedPosts = posts.slice(offset, offset + limit);
        const hasMore = posts.length > offset + limit;

        return {
            posts: paginatedPosts,
            total: posts.length,
            hasMore
        };
    } catch (error) {
        console.error('Error fetching posts with pagination:', error);
        throw error;
    }
};