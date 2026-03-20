// Popular Posts API Route
import { NextRequest, NextResponse } from 'next/server';
import { getPopularPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const posts = await getPopularPosts(limit);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular posts' },
      { status: 500 }
    );
  }
}
