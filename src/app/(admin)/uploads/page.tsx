import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users, artistUploads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Badge } from '@/components/index';

async function checkAdminAccess(user: any) {
  if (!user) return false;
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

export default async function AdminUploadsPage() {
  const user = await currentUser();
  const isAdmin = await checkAdminAccess(user);
  if (!isAdmin) {
    redirect('/');
  }

  const uploads = await db
    .select()
    .from(artistUploads)
    .orderBy(artistUploads.createdAt);

  const statusVariants = {
    pending: 'warning' as const,
    fulfilled: 'success' as const,
    rejected: 'danger' as const,
  };

  const pendingCount = uploads.filter((u) => u.status === 'pending').length;
  const fulfilledCount = uploads.filter((u) => u.status === 'fulfilled').length;

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">📤 Upload Queue</h1>
        <p className="text-slate-400">Review and manage artist submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Fulfilled</p>
          <p className="text-3xl font-bold text-green-400">{fulfilledCount}</p>
        </div>
        <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400 mb-2">Total</p>
          <p className="text-3xl font-bold">{uploads.length}</p>
        </div>
      </div>

      {/* Upload Table */}
      {uploads.length === 0 ? (
        <div className="p-12 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
          <p className="text-slate-400">No uploads yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {uploads.map((upload) => {
                  const metadata = upload.metadata ? JSON.parse(upload.metadata) : {};
                  return (
                    <tr key={upload.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">{metadata.title || 'Untitled'}</td>
                      <td className="px-6 py-4 text-slate-400">{metadata.genre || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={statusVariants[upload.status as keyof typeof statusVariants] || 'default'}
                        >
                          {upload.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {upload.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500 transition">
                              Approve
                            </button>
                            <button className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
