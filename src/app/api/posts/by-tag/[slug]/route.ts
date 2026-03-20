// API Route: Get Posts by Tag
import { NextRequest, NextResponse } from 'next/server';
import { getPostsByTag } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const posts = await getPostsByTag(decodedSlug, 20);

    // Serialize dates for JSON response
    const serializedPosts = posts.map((post: any) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString?.() || null,
      createdAt: post.createdAt?.toISOString?.() || null,
      updatedAt: post.updatedAt?.toISOString?.() || null,
    }));

    return NextResponse.json(serializedPosts);
  } catch (err) {
    console.error('Error fetching posts by tag:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
