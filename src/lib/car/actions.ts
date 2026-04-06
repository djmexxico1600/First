'use server';

import { getDb } from '@/lib/db/client';
import { carPosts } from '@/lib/db/schema';

export async function getCarPosts() {
  try {
    const db = getDb();
    const posts = await db
      .select()
      .from(carPosts)
      .orderBy(carPosts.publishedAt);

    return posts;
  } catch (error) {
    console.error('Failed to fetch car posts:', error);
    return [];
  }
}
