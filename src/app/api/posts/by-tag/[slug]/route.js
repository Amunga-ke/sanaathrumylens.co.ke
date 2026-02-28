import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { slug } = params;
        const decodedSlug = decodeURIComponent(slug);

        // Fetch posts where tags array includes this tag
        const snapshot = await db
            .collection('posts')
            .where('status', '==', 'published')
            .where('isDeleted', '==', false)
            .where('tags', 'array-contains', decodedSlug)
            .orderBy('publishedAt', 'desc')
            .get();

        const posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug || doc.id,
                title: data.title || '',
                excerpt: data.excerpt || data.description || '',
                description: data.description || '',
                coverImage: data.coverImage || data.featuredImage || null,
                publishedAt: data.publishedAt ? data.publishedAt.toDate().toISOString() : null,
                author: data.authorSnapshot || data.author || null,
                tags: data.tags || [],
            };
        });

        return NextResponse.json(posts);
    } catch (err) {
        console.error('Error fetching posts by tag:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
