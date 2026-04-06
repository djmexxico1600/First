'use client';

import { useState } from 'react';
import { Button, Badge } from '@/components/index';
import { createBeatCheckoutSession } from '@/lib/stripe/actions';

interface BeatPurchaseProps {
  beatId: string;
  beatTitle: string;
  leasePrice: number;
  exclusivePrice: number;
  genre?: string;
  bpm?: number;
}

export function BeatPurchaseCard({
  beatId,
  beatTitle,
  leasePrice,
  exclusivePrice,
  genre,
  bpm,
}: BeatPurchaseProps) {
  const [selectedLicense, setSelectedLicense] = useState<'lease' | 'exclusive'>('lease');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const price = selectedLicense === 'lease' ? leasePrice : exclusivePrice;

  const handlePurchase = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await createBeatCheckoutSession(beatId, selectedLicense);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-slate-700 transition">
      {/* Placeholder for beat artwork/waveform */}
      <div className="aspect-square bg-gradient-to-br from-cyan-600/20 to-blue-600/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-2">🎵</p>
          <p className="text-xs text-slate-400">Beat Artwork</p>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <h3 className="text-lg font-bold mb-2 truncate">{beatTitle}</h3>

        {/* Meta Info */}
        <div className="flex gap-2 mb-4">
          {genre && <Badge variant="default">{genre}</Badge>}
          {bpm && <Badge variant="default">{bpm} BPM</Badge>}
        </div>

        {/* Preview Button */}
        {false && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="mb-4 text-sm text-cyan-400 hover:text-cyan-300 transition"
          >
            {showPreview ? '⏸ Stop Preview' : '▶️ Play Preview'}
          </button>
        )}

        {/* License Selection */}
        <div className="mb-6 space-y-3">
          {/* Lease Option */}
          <label className="flex gap-3 p-3 rounded border cursor-pointer transition" 
            style={{
              borderColor: selectedLicense === 'lease' ? 'rgb(34, 197, 94)' : 'rgb(30, 41, 59)',
              backgroundColor: selectedLicense === 'lease' ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
            }}>
            <input
              type="radio"
              value="lease"
              checked={selectedLicense === 'lease'}
              onChange={(e) => setSelectedLicense(e.target.value as 'lease' | 'exclusive')}
              className="mt-1"
            />
            <div>
              <p className="font-semibold text-sm">Beat Lease</p>
              <p className="text-xs text-slate-400">Limited commercial license</p>
            </div>
            <p className="ml-auto font-bold text-cyan-400 text-sm whitespace-nowrap">
              ${leasePrice.toFixed(2)}
            </p>
          </label>

          {/* Exclusive Option */}
          <label className="flex gap-3 p-3 rounded border cursor-pointer transition"
            style={{
              borderColor: selectedLicense === 'exclusive' ? 'rgb(34, 197, 94)' : 'rgb(30, 41, 59)',
              backgroundColor: selectedLicense === 'exclusive' ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
            }}>
            <input
              type="radio"
              value="exclusive"
              checked={selectedLicense === 'exclusive'}
              onChange={(e) => setSelectedLicense(e.target.value as 'lease' | 'exclusive')}
              className="mt-1"
            />
            <div>
              <p className="font-semibold text-sm">Beat Exclusive</p>
              <p className="text-xs text-slate-400">Full rights & ownership</p>
            </div>
            <p className="ml-auto font-bold text-cyan-400 text-sm whitespace-nowrap">
              ${exclusivePrice.toFixed(2)}
            </p>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/20 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          isLoading={isLoading}
          fullWidth
          className="mb-2"
        >
          Purchase Beat (${price.toFixed(2)})
        </Button>

        {/* Instant Download Note */}
        <p className="text-xs text-slate-500 text-center">
          ✓ Instant download after purchase
        </p>
      </div>
    </div>
  );
}

export function BeatGrid({ beats }: { beats: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {beats.map((beat) => (
        <BeatPurchaseCard
          key={beat.id}
          beatId={beat.id}
          beatTitle={beat.title}
          leasePrice={beat.leasePrice}
          exclusivePrice={beat.exclusivePrice}
          genre={beat.genre}
          bpm={beat.bpm}
        />
      ))}
    </div>
  );
}
