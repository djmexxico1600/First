import { UserButton, currentUser } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            DJMEXXICO
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-cyan-300">
              Dashboard
            </Link>
            <Link href="/dashboard/uploads" className="text-sm text-slate-300 hover:text-cyan-300">
              Uploads
            </Link>
            <Link href="/dashboard/orders" className="text-sm text-slate-300 hover:text-cyan-300">
              Orders
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
