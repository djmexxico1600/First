'use client';

import { useEffect, useRef, useState } from 'react';

interface WaveformPlayerProps {
  previewUrl: string;
  beatTitle: string;
}

export function WaveformPlayer({ previewUrl, beatTitle }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<import('wavesurfer.js').default | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    let ws: import('wavesurfer.js').default;

    // Dynamic import keeps wavesurfer out of the server bundle
    import('wavesurfer.js').then((module) => {
      const WaveSurfer = module.default;
      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: '#334155',       // slate-700
        progressColor: '#22d3ee',   // cyan-400
        cursorColor: '#06b6d4',     // cyan-500
        barWidth: 3,
        barRadius: 2,
        height: 64,
        normalize: true,
        interact: true,
      });

      ws.load(previewUrl);

      ws.on('ready', () => {
        setIsReady(true);
        setDuration(ws.getDuration());
      });

      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      ws.on('timeupdate', (time) => setCurrentTime(time));

      wavesurferRef.current = ws;
    });

    return () => {
      ws?.destroy();
    };
  }, [previewUrl]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-2" role="region" aria-label={`Beat preview: ${beatTitle}`}>
      <div
        ref={containerRef}
        className="w-full rounded bg-slate-800/60 px-2 cursor-pointer"
        aria-hidden="true"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
        >
          {!isReady ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-4 h-4 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-950 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <span className="text-xs text-slate-400 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
