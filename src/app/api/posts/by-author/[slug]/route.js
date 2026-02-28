import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { slug } = params;

        if (!slug) {
            return NextResponse.json({ error: 'Author slug is required' }, { status: 400 });
        }

        // Check if Firestore is initialized
        if (!db) {
            throw new Error('Firestore is not initialized');
        }

        // Fetch posts where author.slug matches
        const snapshot = await db
            .collection('posts')
            .where('status', '==', 'published')
            .where('isDeleted', '==', false)
            .orderBy('publishedAt', 'desc')
            .get();

        const posts = snapshot.docs
            .map((doc) => {
                const data = doc.data();
                const authorSlug =
                    data.authorSnapshot?.slug ||
                    data.author?.slug ||
                    (data.author?.name ? data.author.name.toLowerCase().replace(/\s+/g, '-') : null);

                return {
                    id: doc.id,
                    slug: data.slug || doc.id,
                    title: data.title || '',
                    excerpt: data.excerpt || data.description || '',
                    coverImage: data.coverImage || data.featuredImage || null,
                    publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
                    author: data.authorSnapshot || data.author || null,
                    authorSlug,
                };
            })
            .filter((post) => post.authorSlug === slug);

        return NextResponse.json(posts);
    } catch (err) {
        console.error('Error fetching posts by author:', err);
        return NextResponse.json({
            error: err.message,
            details: 'Failed to fetch posts. Please check server logs.'
        }, { status: 500 });
    }
}