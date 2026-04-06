'use server';

import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function createBeatCheckoutSession(
  beatId: string,
  licenseType: 'lease' | 'exclusive'
) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (!dbUser.length) {
    throw new Error('User not found in database');
  }

  const priceId =
    licenseType === 'lease'
      ? process.env.NEXT_PUBLIC_STRIPE_BEAT_LEASE_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_BEAT_EXCLUSIVE_PRICE_ID;

  if (!priceId) {
    throw new Error('Stripe price ID not configured');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/beats?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/beats?cancelled=true`,
    customer_email: user.emailAddresses[0]?.emailAddress,
    metadata: {
      userId: dbUser[0].id,
      beatId,
      licenseType,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  redirect(session.url);
}

export async function createSubscriptionCheckoutSession(formDataOrTier: FormData | 'basic' | 'pro' | 'vip') {
  // Handle both form submission (FormData) and direct calls (string)
  let tier: 'basic' | 'pro' | 'vip';
  
  if (formDataOrTier instanceof FormData) {
    const tierValue = formDataOrTier.get('tier') as string;
    if (!['basic', 'pro', 'vip'].includes(tierValue)) {
      throw new Error('Invalid tier specified');
    }
    tier = tierValue as 'basic' | 'pro' | 'vip';
  } else {
    tier = formDataOrTier;
  }

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (!dbUser.length) {
    throw new Error('User not found in database');
  }

  const priceIdMap = {
    basic: process.env.NEXT_PUBLIC_STRIPE_SUB_BASIC_PRICE_ID,
    pro: process.env.NEXT_PUBLIC_STRIPE_SUB_PRO_PRICE_ID,
    vip: process.env.NEXT_PUBLIC_STRIPE_SUB_VIP_PRICE_ID,
  };

  const priceId = priceIdMap[tier];

  if (!priceId) {
    throw new Error(`Stripe price ID for ${tier} not configured`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?sub_success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/management?cancelled=true`,
    customer_email: user.emailAddresses[0]?.emailAddress,
    metadata: {
      userId: dbUser[0].id,
      tier,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  redirect(session.url);
}
