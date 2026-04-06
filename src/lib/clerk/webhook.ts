import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { getDb } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function handleClerkWebhook(rawBody: string) {
  const db = getDb();
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing Svix headers');
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: any;
  try {
    evt = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as any;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    throw new Error('Webhook verification failed');
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    // Upsert user into Neon
    await db.insert(users).values({
      id: `clerk_${id}`,
      clerkId: id,
      email,
      name: name || 'User',
    }).onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        name: name || 'User',
        updatedAt: new Date(),
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await db.delete(users).where(eq(users.clerkId, id));
  }

  return { success: true };
}
