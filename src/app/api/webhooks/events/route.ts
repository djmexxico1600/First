import { NextRequest, NextResponse } from 'next/server';
import { track } from '@/lib/analytics';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { success } = await rateLimit(ip, 100); // 100 events per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { event, properties, userId } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Missing event name' },
        { status: 400 }
      );
    }

    // Track the event
    await track(event, properties || {}, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics event error:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
