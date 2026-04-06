import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-4">
              🎵 Music Production Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="text-white">High-Quality Beats</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Expert Management & Car Content
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-4 max-w-2xl mx-auto">
            Production platform by DJMEXXICO
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <div className="text-center">
              <p className="text-sm text-slate-400">All-Time SoundCloud Plays</p>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">230K+</p>
            </div>
            <div className="hidden sm:block w-px bg-slate-800"></div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Instagram Followers</p>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">37K+</p>
            </div>
            <div className="hidden sm:block w-px bg-slate-800"></div>
            <div className="text-center">
              <p className="text-sm text-slate-400">Car Engine Power</p>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">~500 hp</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beats">
              <button className="px-8 py-4 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition w-full sm:w-auto">
                Browse Beats
              </button>
            </Link>
            <Link href="/management">
              <button className="px-8 py-4 rounded border border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400/10 transition w-full sm:w-auto">
                Management Tiers
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Offer</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beats */}
            <div className="p-8 rounded-lg border border-slate-800 hover:border-cyan-400/50 transition bg-slate-900/50 hover:bg-slate-900/80">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2">Premium Beats</h3>
              <p className="text-slate-400 mb-4">
                High-quality production beats available for lease or exclusive ownership. Direct downloads after purchase.
              </p>
              <Link href="/beats">
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                  Browse Beats →
                </button>
              </Link>
            </div>

            {/* Management */}
            <div className="p-8 rounded-lg border border-slate-800 hover:border-cyan-400/50 transition bg-slate-900/50 hover:bg-slate-900/80">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Artist Management</h3>
              <p className="text-slate-400 mb-4">
                Tiered subscriptions with SoundCloud placements, Instagram promos, and distribution support.
              </p>
              <Link href="/management">
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                  View Tiers →
                </button>
              </Link>
            </div>

            {/* Car Content */}
            <div className="p-8 rounded-lg border border-slate-800 hover:border-cyan-400/50 transition bg-slate-900/50 hover:bg-slate-900/80">
              <div className="text-4xl mb-4">🏎️</div>
              <h3 className="text-xl font-bold mb-2">Car Build Content</h3>
              <p className="text-slate-400 mb-4">
                Follow the 2010 Cadillac CTS ~500hp build journey with photos, videos, and detailed specs.
              </p>
              <Link href="/car">
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                  View Gallery →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Beat Lease */}
            <div className="p-8 rounded-lg border border-slate-700 bg-slate-900">
              <h3 className="text-lg font-bold mb-2">Beat Lease</h3>
              <p className="text-3xl font-bold text-cyan-400 mb-4">$24.99</p>
              <p className="text-sm text-slate-400 mb-6">Limited license for commercial use</p>
              <Link href="/beats">
                <button className="w-full px-4 py-2 rounded border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition font-semibold">
                  Browse Leases
                </button>
              </Link>
            </div>

            {/* Management Basic */}
            <div className="p-8 rounded-lg border border-slate-700 bg-slate-900">
              <h3 className="text-lg font-bold mb-2">Management Basic</h3>
              <p className="text-3xl font-bold text-cyan-400 mb-4">$29.99</p>
              <p className="text-sm text-slate-400 mb-6">Monthly SoundCloud & Instagram support</p>
              <Link href="/management">
                <button className="w-full px-4 py-2 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition font-semibold">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Exclusive */}
            <div className="p-8 rounded-lg border border-cyan-400/50 bg-gradient-to-b from-slate-900 to-cyan-950/20">
              <span className="inline-block px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-4">POPULAR</span>
              <h3 className="text-lg font-bold mb-2">Beat Exclusive</h3>
              <p className="text-3xl font-bold text-cyan-400 mb-4">$99.99</p>
              <p className="text-sm text-slate-400 mb-6">Full ownership & commercial rights</p>
              <Link href="/beats">
                <button className="w-full px-4 py-2 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition font-semibold">
                  Browse Exclusives
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-y border-cyan-400/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of music professionals and car enthusiasts
          </p>
          <Link href="/beats">
            <button className="px-8 py-4 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition">
              Explore Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
