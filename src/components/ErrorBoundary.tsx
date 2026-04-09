import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'حدث خطأ غير متوقع في التطبيق.';
      let isPermissionError = false;

      try {
        if (this.state.error?.message) {
          const errorData = JSON.parse(this.state.error.message);
          if (errorData.error && errorData.error.includes('Missing or insufficient permissions')) {
            isPermissionError = true;
            errorMessage = 'عذراً، ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء. تأكد من أنك مسجل الدخول بحساب المسؤول.';
          }
        }
      } catch (e) {
        // Not a JSON error message
        if (this.state.error?.message.includes('Missing or insufficient permissions')) {
          isPermissionError = true;
          errorMessage = 'عذراً، ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء. تأكد من أنك مسجل الدخول بحساب المسؤول.';
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] p-4 font-arabic" dir="rtl">
          <div className="max-w-md w-full glass p-8 rounded-[2.5rem] text-center border border-white/10">
            <div className="h-20 w-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              {isPermissionError ? 'خطأ في الصلاحيات' : 'حدث خطأ ما'}
            </h1>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              {errorMessage}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-600/20 transition-all"
              >
                <RefreshCw className="h-5 w-5" />
                إعادة تحميل التطبيق
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <Home className="h-5 w-5" />
                العودة للرئيسية
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40">
                <pre className="text-[10px] text-red-300 font-mono">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
