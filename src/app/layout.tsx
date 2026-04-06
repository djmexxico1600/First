import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJMEXXICO | Music Production & Car Content',
  description:
    'High-quality beats, management tiers, and exclusive car build content from DJMEXXICO.',
  openGraph: {
    title: 'DJMEXXICO | Music Production & Car Content',
    description: 'High-quality beats, management subscriptions, and 2010 Cadillac CTS build showcase.',
    url: 'https://djmexxico.com',
    type: 'website',
    images: [
      {
        url: 'https://djmexxico.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DJMEXXICO | Music Production & Car Content',
    description: 'High-quality beats, management subscriptions, car builds.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="antialiased">
          <ErrorBoundary>
            {children}
            <ToastProvider />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
