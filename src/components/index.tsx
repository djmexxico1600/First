import React from 'react';
import { cn } from '@/lib/utils';

// Re-export all UI components from ui directory
export { Button, buttonVariants } from './ui/Button';
export { Input } from './ui/Input';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './ui/Card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/Dialog';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './ui/Select';
export { Skeleton } from './ui/Skeleton';
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './ui/Toast';
export { Toaster } from './ui/Toaster';

// Feature components
export { BeatPurchaseCard, BeatGrid } from './BeatCard';
export { ArtistUploadForm } from './ArtistUploadForm';
export { ErrorBoundary } from './ErrorBoundary';

// Badge component
export const Badge = ({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}) => {
  const variants = {
    default: 'bg-slate-700 text-slate-100',
    success: 'bg-green-900/50 text-green-300',
    warning: 'bg-yellow-900/50 text-yellow-300',
    danger: 'bg-red-900/50 text-red-300',
  };

  return (
    <span
      className={cn(
        'inline-block px-3 py-1 text-xs font-semibold rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
