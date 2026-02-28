import { db } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { slug } = params;

        // Try authors collection first
        let snapshot = await db.collection('authors').where('slug', '==', slug).limit(1).get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return NextResponse.json({
                id: doc.id,
                slug: data.slug || doc.id,
                name: data.name || data.displayName || slug,
                bio: data.bio || data.description || null,
                avatar: data.avatar || data.photoURL || data.profileImage || null,
            });
        }

        // Try users collection as fallback
        snapshot = await db.collection('users').where('slug', '==', slug).limit(1).get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return NextResponse.json({
                id: doc.id,
                slug: data.slug || doc.id,
                name: data.name || data.displayName || slug,
                bio: data.bio || null,
                avatar: data.avatar || data.photoURL || null,
            });
        }

        // Not found
        return NextResponse.json(
            { error: 'Author not found' },
            { status: 404 }
        );
    } catch (err) {
        console.error('Error fetching author:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
