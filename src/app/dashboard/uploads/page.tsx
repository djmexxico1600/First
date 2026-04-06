import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ArtistUploadForm } from '@/components/ArtistUploadForm';

export default async function UploadsPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">📤 Submit Tracks</h1>
        <p className="text-slate-400">Upload your music for distribution and promotion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <ArtistUploadForm />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Upload Status */}
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold mb-4">Upload Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Pending Review</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">In Queue</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Released</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold mb-4">📋 Guidelines</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>✓ Format: MP3, WAV, FLAC</li>
              <li>✓ Length: 1 min - 1 hour</li>
              <li>✓ Size: Max 50MB</li>
              <li>✓ Quality: 128 kbps minimum</li>
              <li>✓ No explicit content without label</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <h3 className="font-bold mb-4">❓ FAQ</h3>
            <details className="space-y-2 text-xs text-slate-400">
              <summary className="cursor-pointer font-semibold text-slate-300">
                How long does review take?
              </summary>
              <p className="pt-2">Typically 1-3 business days</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
