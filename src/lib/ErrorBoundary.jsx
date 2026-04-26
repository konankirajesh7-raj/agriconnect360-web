import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 20 }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '40px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              An unexpected error occurred. Please refresh the page or contact support if the issue persists.
            </p>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, textAlign: 'left', marginBottom: 16, wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Refresh Page</button>
              <button className="btn btn-outline" onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
