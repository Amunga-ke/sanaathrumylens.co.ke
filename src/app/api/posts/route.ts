// Posts API Route
import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const tag = searchParams.get('tag') || undefined;

    const posts = await getPosts({
      limit,
      categoryId,
      authorId,
      tag,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
