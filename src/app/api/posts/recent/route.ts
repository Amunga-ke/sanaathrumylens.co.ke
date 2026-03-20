// Recent Posts API Route
import { NextRequest, NextResponse } from 'next/server';
import { getRecentPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    const posts = await getRecentPosts(limit);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent posts' },
      { status: 500 }
    );
  }
}
