import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          padding: 32, textAlign: 'center'
        }}>
          <div style={{ fontSize: 56 }}>⚠️</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 420 }}>
            {this.state.error?.message || 'An unexpected error occurred on this page.'}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8, padding: '10px 28px' }}
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            🔄 Reload Page
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            onClick={() => window.history.back()}
          >
            ← Go Back
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
