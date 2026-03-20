// Featured Post API Route
import { NextResponse } from 'next/server';
import { getFeaturedPost } from '@/lib/db';

export async function GET() {
  try {
    const post = await getFeaturedPost();
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured post' },
      { status: 500 }
    );
  }
}
