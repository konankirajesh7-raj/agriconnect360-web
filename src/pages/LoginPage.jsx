import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { signInWithOTP, verifyOTP, signInWithPassword, demoLogin } = useAuth();

  // Demo login (works without backend)
  const handleDemoLogin = () => {
    demoLogin();
    navigate('/');
  };

  // Admin password login (try Supabase first, then backend API)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Try Supabase email/password login first
      const email = `${mobile}@agriconnect360.in`;
      const result = await signInWithPassword(email, password);
      if (result.success) {
        navigate('/');
        return;
      }

      // Fallback: try Express backend
      const res = await fetch('/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('agri_admin_token', data.token);
        localStorage.setItem('agri_admin_user', JSON.stringify(data.admin || {}));
        navigate('/');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid credentials. Use Demo Login if backend is offline.');
      }
    } catch (err) {
      setError('Login failed. Use Demo Login if backend is offline.');
    } finally {
      setLoading(false);
    }
  };

  // OTP flow: send OTP
  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signInWithOTP(mobile);
    if (result.success) {
      setStep('otp');
      setOtpSent(true);
    } else {
      setError(result.error || 'Failed to send OTP. Try Demo Login instead.');
    }
    setLoading(false);
  };

  // OTP flow: verify
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyOTP(mobile, otp);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-card)',
    color: 'var(--text-primary)', fontSize: '0.95rem', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at 25% 25%, rgba(34,197,94,0.08) 0%, transparent 60%), radial-gradient(ellipse at 75% 75%, rgba(59,130,246,0.06) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>🌾</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Agri Connect 360
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.9rem' }}>
            Smart Farming Platform — Andhra Pradesh
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px 28px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24, textAlign: 'center' }}>
            {step === 'otp' ? '📱 Verify OTP' : '🔐 Sign In'}
          </div>

          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                  Mobile Number
                </label>
                <input
                  type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                  placeholder="10-digit mobile number" maxLength={10} style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                  Password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password" style={inputStyle}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: 10 }}>
                {loading ? '🔄 Signing in...' : '🔐 Sign In'}
              </button>

              <button type="button" onClick={handleSendOTP} disabled={loading || mobile.length !== 10}
                className="btn btn-outline" style={{ width: '100%', padding: '11px', fontSize: '0.88rem', marginBottom: 10 }}>
                📱 Sign In with OTP
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: '0.85rem', color: '#22c55e', marginBottom: 16, textAlign: 'center' }}>
                ✅ OTP sent to +91-{mobile}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                  Enter 6-digit OTP
                </label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456" maxLength={6} autoFocus
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem', fontWeight: 700 }}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: 10 }}>
                {loading ? '🔄 Verifying...' : '✅ Verify & Login'}
              </button>

              <button type="button" onClick={() => { setStep('login'); setOtp(''); setError(''); }}
                className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>
                ← Back to Login
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '12px 0 8px' }}>or</div>

          <button onClick={handleDemoLogin} className="btn btn-outline"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>
            🚀 Demo Login (No Backend Required)
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🌾 AgriConnect360 v1.0 · Powered by Supabase Auth
          </div>
        </div>
      </div>
    </div>
  );
}
