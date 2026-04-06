'use server';

import { currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db/client';
import { subscriptions, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ServerActionResponse } from '@/types';
import { createSubscriptionCheckoutSession } from '@/lib/stripe/actions';

export async function createManagementCheckoutSession(
  tier: 'basic' | 'pro' | 'vip'
): Promise<void> {
  try {
    return await createSubscriptionCheckoutSession(tier);
  } catch (error) {
    console.error('Management checkout error:', error);
    throw error;
  }
}

export async function cancelSubscription(): ServerActionResponse {
  const db = getDb();
  const user = await currentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (!dbUser.length) {
      return { success: false, error: 'User not found' };
    }

    const userSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, dbUser[0].id))
      .limit(1);

    if (!userSubscription.length) {
      return { success: false, error: 'No active subscription' };
    }

    // Cancel via Stripe
    if (userSubscription[0].stripeSubscriptionId) {
      // await stripe.subscriptions.del(userSubscription[0].stripeSubscriptionId);
    }

    // Update database
    await db
      .update(subscriptions)
      .set({ status: 'cancelled' })
      .where(eq(subscriptions.userId, dbUser[0].id));

    return { success: true };
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

export async function getSubscription() {
  const db = getDb();
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (!dbUser.length) {
    return null;
  }

  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, dbUser[0].id))
    .limit(1);

  return subscription.length > 0 ? subscription[0] : null;
}
