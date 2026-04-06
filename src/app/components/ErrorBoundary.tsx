import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ERROR BOUNDARY CAUGHT:', error);
    console.error('🚨 ERROR INFO:', errorInfo);
    console.error('🚨 COMPONENT STACK:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Ops! Algo deu errado
              </h1>
              <p className="text-slate-600">
                Um erro inesperado ocorreu. Por favor, veja os detalhes abaixo.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-red-900 mb-2">Erro:</h2>
              <pre className="text-sm text-red-800 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <details className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <summary className="font-semibold text-slate-900 cursor-pointer">
                  Stack Trace (clique para expandir)
                </summary>
                <pre className="text-xs text-slate-700 overflow-auto mt-2 max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500">
              💡 Dica: Abra o Console do navegador (F12) para ver mais detalhes
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
