'use client';

import { useEffect, useState } from 'react';
import { toast as toastManager, type Toast } from '@/lib/toast';
import clsx from 'clsx';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onDismiss, toast.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.duration, onDismiss]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: 'bg-green-900/90 text-green-100 border-green-700',
    error: 'bg-red-900/90 text-red-100 border-red-700',
    info: 'bg-blue-900/90 text-blue-100 border-blue-700',
    warning: 'bg-yellow-900/90 text-yellow-100 border-yellow-700',
  };

  return (
    <div
      className={clsx(
        'min-w-[300px] p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right-5 duration-200',
        colors[toast.type]
      )}
      role="alert"
    >
      <div className="flex gap-3 items-start">
        <span className="text-xl flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
        <p className="flex-1 text-sm leading-5">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-lg leading-5 opacity-70 hover:opacity-100 transition flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastManager.subscribe((newToasts) => setToasts(newToasts));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => toastManager.dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
