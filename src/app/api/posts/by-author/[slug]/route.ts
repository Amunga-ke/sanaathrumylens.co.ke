// API Route: Get Posts by Author
import { NextRequest, NextResponse } from 'next/server';
import { getPostsByAuthor, getAuthorBySlug } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // First get the author by slug
    const author = await getAuthorBySlug(decodedSlug);

    if (!author) {
      return NextResponse.json([], { status: 200 });
    }

    const posts = await getPostsByAuthor(author.id, undefined, 20);

    // Serialize dates for JSON response
    const serializedPosts = posts.map((post: any) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString?.() || null,
      createdAt: post.createdAt?.toISOString?.() || null,
      updatedAt: post.updatedAt?.toISOString?.() || null,
      author: author,
    }));

    return NextResponse.json(serializedPosts);
  } catch (err) {
    console.error('Error fetching posts by author:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
