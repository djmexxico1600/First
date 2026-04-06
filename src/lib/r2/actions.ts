'use server';

import { getPresignedUploadUrl } from './client';
import { currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db/client';
import { users, artistUploads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getUploadUrl(
  fileName: string,
  contentType: string,
  type: 'audio' | 'image' | 'video'
) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `uploads/${user.id}/${type}/${timestamp}_${sanitized}`;

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return { uploadUrl, key };
}

export async function createArtistUpload(
  r2Key: string,
  metadata: { title: string; artist: string; genre?: string; upc?: string }
) {
  const db = getDb();
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (!dbUser.length) throw new Error('User not found');

  const upload = await db.insert(artistUploads).values({
    id: `upload_${Date.now()}`,
    userId: dbUser[0].id,
    r2Key,
    metadata: JSON.stringify(metadata),
    status: 'pending',
  });

  return upload;
}
