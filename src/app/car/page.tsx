import { getCarPosts } from '@/lib/car/actions';

export default async function CarPage() {
  const posts = await getCarPosts();

  // Sample car data for demo
  const carSpecs = {
    model: '2010 Cadillac CTS',
    engine: '5.3L V8 LS Engine',
    power: '~500 hp',
    torque: '~500 lb-ft',
    transmission: 'Upgraded Automatic',
    suspension: 'Coilover setup',
    modifications: [
      'Engine tuning & ECU flash',
      'CAI (Cold Air Intake)',
      'Custom exhaust system',
      'Performance headers',
      'Upgraded brakes',
      'Custom wheels & suspension',
    ],
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            2010 Cadillac CTS Build Journey
          </h1>
          <p className="text-lg text-slate-400">
            Follow the complete build of my high-performance 5.3LS Cadillac CTS
          </p>
        </div>

        {/* Car Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-lg border border-slate-800 bg-slate-900/50">
            <h2 className="text-2xl font-bold mb-6">Specifications</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Model</p>
                <p className="text-lg font-bold">{carSpecs.model}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Engine</p>
                <p className="text-lg font-bold">{carSpecs.engine}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Power</p>
                  <p className="text-lg font-bold text-cyan-400">{carSpecs.power}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Torque</p>
                  <p className="text-lg font-bold text-cyan-400">{carSpecs.torque}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Transmission</p>
                <p className="text-lg font-bold">{carSpecs.transmission}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Suspension</p>
                <p className="text-lg font-bold">{carSpecs.suspension}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-lg border border-slate-800 bg-slate-900/50">
            <h2 className="text-2xl font-bold mb-6">Key Modifications</h2>

            <ul className="space-y-3">
              {carSpecs.modifications.map((mod, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300">
                  <span className="text-cyan-400 flex-shrink-0">⚙️</span>
                  <span>{mod}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Build Progress Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Build Gallery</h2>

          {posts.length === 0 ? (
            <div className="p-12 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
              <p className="text-slate-400 mb-4">
                Build documentation coming soon!
              </p>
              <p className="text-sm text-slate-500">
                Follow on Instagram @djmexxico for real-time updates
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-slate-800 overflow-hidden hover:border-cyan-400/50 transition bg-slate-900"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <p className="text-slate-500">Photo Gallery</p>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold mb-2">{post.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="p-8 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-600/10 to-blue-600/10">
          <h2 className="text-2xl font-bold mb-4">Get Build Updates</h2>
          <p className="text-slate-400 mb-6">
            Subscribe to receive updates on the CTS build progress and exclusive content
          </p>

          <form className="flex gap-2 max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
