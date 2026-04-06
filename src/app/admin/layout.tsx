import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  const isAdmin = await checkAdminAccess(user);
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-2xl font-bold text-cyan-400">
            DJMEXXICO Admin
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm text-slate-300 hover:text-cyan-300">
              Dashboard
            </Link>
            <Link href="/admin/uploads" className="text-sm text-slate-300 hover:text-cyan-300">
              Uploads
            </Link>
            <Link href="/admin/beats" className="text-sm text-slate-300 hover:text-cyan-300">
              Beats
            </Link>
            <Link href="/admin/users" className="text-sm text-slate-300 hover:text-cyan-300">
              Users
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </div>
  );
}
