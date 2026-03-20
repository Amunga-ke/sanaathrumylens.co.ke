// Post Like API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { likePost, unlikePost, checkUserLiked } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ liked: false });
    }

    const liked = await checkUserLiked(id, session.user.id);
    return NextResponse.json({ liked });
  } catch (error) {
    console.error('Error checking like:', error);
    return NextResponse.json({ liked: false });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to like posts' },
        { status: 401 }
      );
    }

    const result = await likePost(id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to unlike posts' },
        { status: 401 }
      );
    }

    const result = await unlikePost(id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
