import { handleClerkWebhook } from '@/lib/clerk/webhook';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    await handleClerkWebhook(rawBody);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
