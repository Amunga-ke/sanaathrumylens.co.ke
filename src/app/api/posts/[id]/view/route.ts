// Post View Tracking API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { incrementPostView } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    await incrementPostView(id, session?.user?.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
