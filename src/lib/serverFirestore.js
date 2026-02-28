// src/lib/serverFirestore.js

import { db } from './firebaseAdmin';

// Simple in-memory cache with TTL for server-side fetchers.
const _cache = new Map();

async function cached(key, ttlSeconds, fetcher) {
    const now = Date.now();
    const entry = _cache.get(key);
    if (entry && entry.expires > now) {
        return entry.value;
    }

    const value = await fetcher();
    try {
        _cache.set(key, { value, expires: now + ttlSeconds * 1000 });
    } catch (e) {
        // ignore cache set errors
    }
    return value;
}

/** Fetch published posts for sitemap/rss */
export async function fetchPublishedPosts(limit = 1000) {
    const key = `publishedPosts:${limit}`;
    return cached(key, 30, async () => {
        const snapshot = await db.collection('posts')
            .where('status', '==', 'published')
            .where('isDeleted', '==', false)
            .orderBy('publishedAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                title: data.title || '',
                excerpt: data.excerpt || '',
                coverImage: data.coverImage || data.featuredImage || null,
                featuredImage: data.coverImage || data.featuredImage || null,
                publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
                updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
            };
        });
    });
}

export async function fetchPostBySlug(slug) {
    const key = `postBySlug:${slug}`;
    return cached(key, 60, async () => {
        const q = db.collection('posts').where('slug', '==', slug).limit(1);
        const snapshot = await q.get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            slug: data.slug || doc.id,
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            coverImage: data.coverImage || data.featuredImage || null,
            featuredImage: data.coverImage || data.featuredImage || null,
            publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
            author: data.author || null,
        };
    });
}

/** Fetch published events for sitemap/rss */
export async function fetchPublishedEvents(limit = 1000) {
    const key = `publishedEvents:${limit}`;
    return cached(key, 30, async () => {
        const snapshot = await db.collection('events')
            .where('status', '==', 'published')
            .where('isDeleted', '==', false)
            .orderBy('startDate', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                title: data.title || '',
                excerpt: data.excerpt || data.description || '',
                coverImage: data.coverImage || data.featuredImage || null,
                featuredImage: data.coverImage || data.featuredImage || null,
                startDate: data.startDate ? data.startDate.toDate().toISOString() : null,
                endDate: data.endDate ? data.endDate.toDate().toISOString() : null,
                updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : data.startDate ? data.startDate.toDate().toISOString() : null,
            };
        });
    });
}

export async function fetchEventBySlug(slug) {
    const key = `eventBySlug:${slug}`;
    return cached(key, 60, async () => {
        const q = db.collection('events').where('slug', '==', slug).limit(1);
        const snapshot = await q.get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            slug: data.slug || doc.id,
            title: data.title || '',
            excerpt: data.excerpt || data.description || '',
            description: data.description || '',
            coverImage: data.coverImage || data.featuredImage || null,
            featuredImage: data.coverImage || data.featuredImage || null,
            startDate: data.startDate ? data.startDate.toDate().toISOString() : null,
            endDate: data.endDate ? data.endDate.toDate().toISOString() : null,
            location: data.location || null,
            isOnline: data.isOnline || false,
            organizer: data.createdBy || null,
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : data.startDate ? data.startDate.toDate().toISOString() : null,
        };
    });
}

/** Fetch author/profile by slug (best-effort) */
export async function fetchAuthorBySlug(slug) {
    const key = `authorBySlug:${slug}`;
    return cached(key, 300, async () => {
        // Try authors collection first
        let q = db.collection('authors').where('slug', '==', slug).limit(1);
        let snapshot = await q.get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                name: data.name || data.displayName || slug,
                bio: data.bio || data.description || null,
                avatar: data.avatar || data.photoURL || data.profileImage || null,
            };
        }

        // Try users collection as fallback
        q = db.collection('users').where('slug', '==', slug).limit(1);
        snapshot = await q.get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                name: data.name || data.displayName || slug,
                bio: data.bio || null,
                avatar: data.avatar || data.photoURL || null,
            };
        }

        // Not found - return a minimal object
        return { id: null, slug, name: slug, bio: null, avatar: null };
    });
}

export async function fetchPostsByTag(tagName, limit = 20) {
    const key = `postsByTag:${tagName}:${limit}`;
    return cached(key, 30, async () => {
        const snapshot = await db.collection('posts')
            .where('tags', 'array-contains', tagName)
            .where('status', '==', 'published')
            .where('isDeleted', '==', false)
            .orderBy('publishedAt', 'desc')
            .limit(limit)
            .get();

        const posts = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Fetch author if available
                let authorData = null;
                if (data.authorId) {
                    try {
                        const authorDoc = await db.collection('authors').doc(data.authorId).get();
                        if (authorDoc.exists) {
                            authorData = {
                                id: authorDoc.id,
                                name: authorDoc.data().name || authorDoc.data().displayName || '',
                                slug: authorDoc.data().slug || authorDoc.data().name?.toLowerCase().replace(/\s+/g, '-') || authorDoc.id,
                                avatar: authorDoc.data().avatar || authorDoc.data().photoURL || null,
                            };
                        }
                    } catch (err) {
                        console.error('Error fetching author:', err);
                    }
                }

                return {
                    id: doc.id,
                    slug: data.slug || doc.id,
                    title: data.title || '',
                    excerpt: data.excerpt || '',
                    description: data.description || '',
                    coverImage: data.coverImage || data.featuredImage || null,
                    featuredImage: data.coverImage || data.featuredImage || null,
                    publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                    author: authorData || data.authorSnapshot,
                    stats: {
                        views: data.stats?.views || 0,
                        likes: data.stats?.likes || 0,
                        comments: data.stats?.comments || 0,
                        updatedAt: data.stats?.updatedAt ? data.stats.updatedAt.toDate().toISOString() : null,
                    }
                };
            })
        );

        return posts;
    });
}
