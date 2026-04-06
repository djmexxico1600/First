import { getBeats } from '@/lib/beats/actions';
import { BeatGrid } from '@/components/BeatCard';
import { Suspense } from 'react';
import { Skeleton } from '@/components/index';

function BeatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="w-full h-96" />
      ))}
    </div>
  );
}

async function BeatsContent() {
  const beats = await getBeats();

  if (beats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg mb-4">No beats available yet</p>
        <p className="text-slate-500">Check back soon for new releases!</p>
      </div>
    );
  }

  return <BeatGrid beats={beats} />;
}

export default function BeatsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Beats Store</h1>
          <p className="text-lg text-slate-400">
            High-quality production beats available for lease or exclusive ownership
          </p>
        </div>

        <Suspense fallback={<BeatsLoading />}>
          <BeatsContent />
        </Suspense>
      </div>
    </div>
  );
}
