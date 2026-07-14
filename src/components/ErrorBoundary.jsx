import React from 'react';

/**
 * Error Boundary - catches runtime errors and prevents white screen of death
 * Particularly important for Three.js WebGL context loss and canvas errors
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 text-white p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan</h1>
            <p className="text-sm text-slate-300 mb-4">
              Aplikasi mengalami error tak terduga. Anda dapat mencoba lagi atau
              memuat ulang halaman.
            </p>
            {this.state.error && (
              <details className="text-left bg-slate-900 rounded-lg p-3 mb-4 text-xs text-slate-400 max-h-40 overflow-y-auto">
                <summary className="cursor-pointer text-slate-300 mb-1">
                  Detail Error
                </summary>
                <pre className="whitespace-pre-wrap break-all">
                  {this.state.error?.message || 'Unknown error'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleDismiss}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
