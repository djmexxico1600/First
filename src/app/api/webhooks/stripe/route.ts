import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { users, orders, subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, beatId, licenseType, tier } = session.metadata || {};

        if (beatId && licenseType) {
          // One-time beat purchase
          await db.insert(orders).values({
            id: `order_${Date.now()}`,
            userId: userId!,
            beatId,
            stripeSessionId: session.id,
            type: 'beat',
            amount: (session.amount_total || 0) / 100,
            status: 'completed',
            metadata: JSON.stringify({ licenseType }),
          });
        }

        if (tier) {
          // Subscription started
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await db.insert(subscriptions).values({
            id: `sub_${Date.now()}`,
            userId: userId!,
            stripeSubscriptionId: sub.id,
            tier: tier as 'basic' | 'pro' | 'vip',
            status: 'active',
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          });

          // Update user tier
          await db
            .update(users)
            .set({ currentTier: tier as any, updatedAt: new Date() })
            .where(eq(users.id, userId!));
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Handle recurring subscription payment
          console.log('Invoice paid for subscription:', invoice.subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({
            status: sub.status as any,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ 
            status: 'cancelled', 
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
