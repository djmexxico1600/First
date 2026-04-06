'use server';

import { getDb } from '@/lib/db/client';
import { beats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getBeats() {
  try {
    const db = getDb();
    const allBeats = await db
      .select()
      .from(beats)
      .where(eq(beats.status, 'published'))
      .orderBy(beats.createdAt);

    return allBeats;
  } catch (error) {
    console.error('Failed to fetch beats:', error);
    throw new Error('Failed to fetch beats');
  }
}

export async function getBeatById(beatId: string) {
  try {
    const db = getDb();
    const beat = await db
      .select()
      .from(beats)
      .where(eq(beats.id, beatId))
      .limit(1);

    return beat[0] || null;
  } catch (error) {
    console.error('Failed to fetch beat:', error);
    throw new Error('Failed to fetch beat');
  }
}
