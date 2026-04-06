import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users, subscriptions, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  const currentSubscription = dbUser.length
    ? await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, dbUser[0].id))
        .limit(1)
    : [];

  const recentOrders = dbUser.length
    ? await db
        .select()
        .from(orders)
        .where(eq(orders.userId, dbUser[0].id))
        .orderBy(orders.createdAt)
        .limit(5)
    : [];

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user.firstName}! 🎵</h1>
        <p className="text-slate-400">Manage your beats, subscriptions, and uploads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Current Tier */}
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm text-slate-400 mb-2">Current Tier</h3>
          <p className="text-2xl font-bold text-cyan-400 capitalize">
            {dbUser[0]?.currentTier === 'none' ? 'Free User' : dbUser[0]?.currentTier}
          </p>
          {currentSubscription.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Renews{' '}
              {new Date(
                currentSubscription[0].currentPeriodEnd || new Date()
              ).toLocaleDateString()}
            </p>
          )}
          {dbUser[0]?.currentTier === 'none' && (
            <Link href="/management">
              <button className="mt-4 px-4 py-2 rounded text-sm bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 w-full">
                Upgrade Tier
              </button>
            </Link>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm text-slate-400 mb-2">Total Purchases</h3>
          <p className="text-2xl font-bold">{recentOrders.length}</p>
          <Link href="/dashboard/orders">
            <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300">
              View Orders →
            </button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm text-slate-400 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/uploads">
              <button className="w-full text-left px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-800 transition">
                📤 New Upload
              </button>
            </Link>
            <Link href="/beats">
              <button className="w-full text-left px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-800 transition">
                🎵 Browse Beats
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      {recentOrders.length > 0 && (
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <h3 className="font-bold mb-4">Recent Purchases</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center py-3 border-b border-slate-800 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{order.type}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400">${order.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/orders">
            <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300">
              View All Orders →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
