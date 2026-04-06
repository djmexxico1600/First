import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { users, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/index';

export default async function OrdersPage() {
  const db = getDb();
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
    redirect('/sign-in');
  }

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, dbUser[0].id))
    .orderBy(orders.createdAt);

  const statusVariants = {
    pending: 'warning' as const,
    completed: 'success' as const,
    failed: 'danger' as const,
    refunded: 'danger' as const,
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">📦 Order History</h1>
        <p className="text-slate-400">View all your purchases and subscriptions</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="p-12 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
          <p className="text-slate-400 mb-4">No orders yet</p>
          <a
            href="/beats"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Browse beats →
          </a>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {userOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-cyan-400">
                        {order.id.slice(0, 12)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold">
                      {order.type}
                    </td>
                    <td className="px-6 py-4 font-bold text-cyan-400">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[order.status as keyof typeof statusVariants] || 'default'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-cyan-400">
            ${userOrders
              .filter((o) => o.status === 'completed')
              .reduce((sum, o) => sum + o.amount, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Total Orders</p>
          <p className="text-3xl font-bold">{userOrders.length}</p>
        </div>
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-400">
            {userOrders.filter((o) => o.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
}
