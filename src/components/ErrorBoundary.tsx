import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Можно отправить ошибку в сервис логирования
    console.error("React ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: 28, marginBottom: 16 }}>Произошла ошибка</h1>
          <p style={{ color: '#555', marginBottom: 16 }}>Что-то пошло не так. Попробуйте обновить страницу или обратитесь к администратору.</p>
          {this.state.error && (
            <pre style={{ color: '#ef4444', background: '#f3f4f6', padding: 16, borderRadius: 8, maxWidth: 600, margin: '0 auto', overflowX: 'auto' }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
} 