// User Profile API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  updateEditorProfile, 
  checkProfileCompletion, 
  dismissProfileReminder,
  getUserById 
} from '@/lib/db';

// GET - Check profile completion status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.user.id);
    const completionStatus = await checkProfileCompletion(session.user.id);

    return NextResponse.json({
      user,
      profileCompletion: completionStatus
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update editor profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, website, image, twitter, instagram, linkedin, facebook } = body;

    const updatedUser = await updateEditorProfile(session.user.id, {
      name,
      bio,
      website,
      image,
      twitter,
      instagram,
      linkedin,
      facebook
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// POST - Dismiss profile reminder
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await dismissProfileReminder(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss reminder' },
      { status: 500 }
    );
  }
}
