import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      padding: 32, textAlign: 'center'
    }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🌾</div>
      <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Page Not Found
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 380 }}>
        This page doesn't exist or has been moved. Let's get you back to the farm.
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" style={{ padding: '11px 28px' }} onClick={() => navigate('/dashboard')}>
          🏠 Go to Dashboard
        </button>
        <button className="btn btn-outline" style={{ padding: '11px 20px' }} onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}
