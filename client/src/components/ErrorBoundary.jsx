import React from 'react';
import { AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="p-8 my-4 bg-slate-900/90 border border-rose-500/40 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {this.props.title || 'Bu Bölüm Görüntülenirken Bir Hata Oluştu'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {this.state.error?.message || 'Beklenmeyen bir arayüz hatası meydana geldi.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeniden Dene</span>
            </button>
            {this.props.fallbackAction && (
              <button
                onClick={() => {
                  this.props.fallbackAction();
                  this.handleReset();
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl border border-cyan-400/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{this.props.fallbackActionText || 'Alternatif Görünümü Aç'}</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
