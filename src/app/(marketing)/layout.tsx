import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300">
            DJMEXXICO
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/beats" className="text-sm text-slate-300 hover:text-cyan-300 transition">
              Beats
            </Link>
            <Link href="/management" className="text-sm text-slate-300 hover:text-cyan-300 transition">
              Management
            </Link>
            <Link href="/car" className="text-sm text-slate-300 hover:text-cyan-300 transition">
              Car Build
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-300 hover:text-cyan-300 transition">
                  Dashboard
                </Link>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10'
                    }
                  }}
                />
              </>
            ) : (
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm rounded border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm rounded bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {children}

      <footer className="border-t border-slate-800 bg-slate-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-cyan-400 font-bold mb-4">DJMEXXICO</h3>
              <p className="text-sm text-slate-400">High-quality beats, management, and car content.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/beats" className="hover:text-cyan-400">Beats Store</Link></li>
                <li><Link href="/management" className="hover:text-cyan-400">Management Tiers</Link></li>
                <li><Link href="/car" className="hover:text-cyan-400">Car Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terms" className="hover:text-cyan-400">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://instagram.com/djmexxico" target="_blank" className="hover:text-cyan-400">Instagram</a></li>
                <li><a href="https://soundcloud.com/djmexxico" target="_blank" className="hover:text-cyan-400">SoundCloud</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 DJMEXXICO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
