// API Route: Get Author by Slug
import { NextRequest, NextResponse } from 'next/server';
import { getAuthorBySlug, getPostsByAuthor } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const author = await getAuthorBySlug(decodedSlug);

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // Get posts by this author
    const posts = await getPostsByAuthor(author.id, undefined, 20);

    // Serialize for JSON response
    const serializedAuthor = {
      ...author,
      createdAt: author.createdAt?.toISOString?.() || null,
      updatedAt: author.updatedAt?.toISOString?.() || null,
      posts: posts.map((post: any) => ({
        ...post,
        publishedAt: post.publishedAt?.toISOString?.() || null,
        createdAt: post.createdAt?.toISOString?.() || null,
        updatedAt: post.updatedAt?.toISOString?.() || null,
      })),
      postCount: posts.length,
    };

    return NextResponse.json(serializedAuthor);
  } catch (err) {
    console.error('Error fetching author:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch author' },
      { status: 500 }
    );
  }
}
