import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdminAccess(user: any) {
  const db = getDb();
  if (!user) return false;

  // Check if user is admin by email or role
  const adminEmails = ['admin@djmexxico.com', 'djmexxico@example.com'];
  if (adminEmails.includes(user.emailAddresses[0]?.emailAddress || '')) {
    return true;
  }

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  return dbUser.length > 0 && dbUser[0].role === 'admin';
}

export default async function AdminPage() {
  const user = await currentUser();

  const isAdmin = await checkAdminAccess(user);
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-slate-400">Manage platform, uploads, and analytics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-cyan-400">$0.00</p>
            <p className="text-xs text-slate-500 mt-2">This month</p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Active Users</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-slate-500 mt-2">With tier</p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Pending Uploads</p>
            <p className="text-3xl font-bold text-yellow-400">0</p>
            <p className="text-xs text-slate-500 mt-2">Awaiting review</p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <p className="text-sm text-slate-400 mb-2">Total Beats</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-slate-500 mt-2">Published</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-cyan-400/50 transition cursor-pointer">
            <h3 className="font-bold text-lg mb-2">📤 Upload Queue</h3>
            <p className="text-sm text-slate-400 mb-4">Review and fulfill artist uploads</p>
            <a href="#uploads" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              View Queue →
            </a>
          </div>

          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-cyan-400/50 transition cursor-pointer">
            <h3 className="font-bold text-lg mb-2">🎵 Beat Management</h3>
            <p className="text-sm text-slate-400 mb-4">Add, edit, or publish beats</p>
            <a href="#beats" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              Manage Beats →
            </a>
          </div>

          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-cyan-400/50 transition cursor-pointer">
            <h3 className="font-bold text-lg mb-2">👥 Users</h3>
            <p className="text-sm text-slate-400 mb-4">Manage users and subscriptions</p>
            <a href="#users" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              View Users →
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold mb-6">📊 Recent Activity</h2>
          <div className="text-center py-12">
            <p className="text-slate-400">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
