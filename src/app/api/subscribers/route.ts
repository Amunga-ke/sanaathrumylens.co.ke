// Newsletter Subscribers API Route
import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/db';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const result = await subscribeToNewsletter(email);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json(
      { success: false, message: 'Subscription failed' },
      { status: 500 }
    );
  }
}
