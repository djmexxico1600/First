import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // await captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md w-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-500 mb-4">Oops! Something went wrong</h1>
              <p className="text-slate-400 mb-8">
                {process.env.NODE_ENV === 'development'
                  ? this.state.error?.message
                  : 'We encountered an unexpected error. Please try again.'}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-6 py-2 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
