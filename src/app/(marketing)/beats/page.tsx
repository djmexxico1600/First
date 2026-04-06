import { getBeats } from '@/lib/beats/actions';
import Link from 'next/link';

export default async function BeatsPage() {
  const beats = await getBeats();

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Beats Store</h1>
          <p className="text-lg text-slate-400">
            High-quality production beats available for lease or exclusive ownership
          </p>
        </div>

        {beats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">No beats available yet</p>
            <p className="text-slate-500">Check back soon for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beats.map((beat) => (
              <div
                key={beat.id}
                className="p-6 rounded-lg border border-slate-800 hover:border-cyan-400/50 transition bg-slate-900/50 hover:bg-slate-900"
              >
                <h3 className="text-xl font-bold mb-2">{beat.title}</h3>
                {beat.genre && (
                  <p className="text-sm text-cyan-400 mb-2">{beat.genre}</p>
                )}
                {beat.bpm && (
                  <p className="text-sm text-slate-400 mb-4">{beat.bpm} BPM</p>
                )}
                {beat.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {beat.description}
                  </p>
                )}

                <div className="flex gap-4 mt-6">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Lease</p>
                    <p className="text-lg font-bold text-cyan-400">
                      ${beat.leasePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Exclusive</p>
                    <p className="text-lg font-bold text-cyan-400">
                      ${beat.exclusivePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button className="flex-1 px-4 py-2 rounded border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition text-sm font-semibold">
                    Preview
                  </button>
                  <button className="flex-1 px-4 py-2 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition text-sm font-semibold">
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
