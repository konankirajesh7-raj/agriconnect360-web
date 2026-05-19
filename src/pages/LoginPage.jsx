import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { useLanguage } from '../lib/i18n/LanguageContext';


const FEATURES = [
  { icon: '🌾', title: 'Smart Crop Advisory', desc: 'AI-powered recommendations in Telugu' },
  { icon: '📊', title: 'Live Market Prices', desc: 'Real-time mandi rates for 20+ crops' },
  { icon: '🌦️', title: 'Weather Intelligence', desc: '7-day hyper-local AP forecasts' },
  { icon: '💰', title: 'Financial Services', desc: 'KCC tracking, loans & insurance' },
];

export default function LoginPage() {
  const { t, tx } = useLanguage();
  const [step, setStep] = useState('new'); // 'new' | 'returning' | 'forgot' | 'otp'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpPassword, setOtpPassword] = useState('');
  const [showOtpPassword, setShowOtpPassword] = useState(false);
  const [otpFullName, setOtpFullName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [googleSetup, setGoogleSetup] = useState(false);
  const [googlePhone, setGooglePhone] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showGooglePwd, setShowGooglePwd] = useState(false);
  const [googlePhoneError, setGooglePhoneError] = useState('');


  const [pendingRedirect, setPendingRedirect] = useState('');
  const [adminRolePicker, setAdminRolePicker] = useState(false);
  // Rate limiting: max 5 attempts, then 30s cooldown
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const t = setInterval(() => {
      const rem = Math.ceil((lockUntil - Date.now()) / 1000);
      if (rem <= 0) { setCooldown(0); clearInterval(t); }
      else setCooldown(rem);
    }, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithOTP, verifyOTP, signInWithPassword, signInWithGoogle, demoLogin, signUp, isAuthenticated, loading: authLoading, resetPassword, updateUserPassword, user, updateProfile } = useAuth();

  // OTP resend countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setInterval(() => setOtpCountdown(p => p <= 1 ? 0 : p - 1), 1000);
    return () => clearInterval(t);
  }, [otpCountdown]);

  // Auto-redirect when auth state becomes authenticated
  useEffect(() => {
    if (isAuthenticated && pendingRedirect) {
      const dest = pendingRedirect;
      setPendingRedirect('');
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, pendingRedirect, navigate]);

  // Detect Google OAuth callback
  useEffect(() => {
    if (searchParams.get('provider') === 'google' && isAuthenticated && user) {
      const isGoogle = user?.app_metadata?.provider === 'google' || user?.identities?.some(i => i.provider === 'google');
      if (isGoogle) {
        // Check if user already completed onboarding (returning user)
        const onbStatus = localStorage.getItem('rythusphere_onboarding_complete');
        if (onbStatus === 'true' || onbStatus === 'skipped') {
          navigate('/dashboard', { replace: true });
        } else {
          setGoogleSetup(true);
          setGoogleName(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
        }
      }
    }
  }, [searchParams, isAuthenticated, user, navigate]);

  // Rotate features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);



  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    const result = await signInWithGoogle();
    if (!result.success) setError(result.error || 'Google sign-in failed. Please try again.');
    setLoading(false);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(otpPhone)) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    setLoading(true); setError('');
    const result = await signInWithOTP(otpPhone);
    if (result.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      setSuccess('OTP sent to +91 ' + otpPhone + '. Check your SMS.');
    } else {
      setError(result.error || 'Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    const result = await verifyOTP(otpPhone, otpCode);
    if (result.success) {
      setOtpVerified(true);
      setOtpSent(false);
      setSuccess('Phone verified! Now set your name and password.');
      setError('');
    } else {
      setError(result.error || 'Invalid OTP. Try again.');
    }
    setLoading(false);
  };

  const checkGooglePhoneUnique = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setGooglePhone(clean);
    if (clean.length === 10) {
      const reg = JSON.parse(localStorage.getItem('rs_registered_users') || '[]');
      setGooglePhoneError(reg.includes(clean) ? 'This number is already registered!' : '');
    } else {
      setGooglePhoneError('');
    }
  };

  const handleGoogleSetup = async (e) => {
    e.preventDefault();
    if (!googleName.trim()) { setError('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(googlePhone)) { setError('Enter a valid 10-digit mobile number'); return; }
    if (googlePhoneError) { setError(googlePhoneError); return; }
    if (googlePassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      // Set password on Supabase auth
      await updateUserPassword(googlePassword);
      // Save phone to registered list
      const reg = JSON.parse(localStorage.getItem('rs_registered_users') || '[]');
      if (!reg.includes(googlePhone)) { reg.push(googlePhone); localStorage.setItem('rs_registered_users', JSON.stringify(reg)); }
      // Update profile with phone + name
      await updateProfile({ name: googleName, full_name: googleName, mobile: googlePhone, phone: googlePhone });
      setSuccess('✅ Account setup complete! Redirecting to onboarding...');
      setTimeout(() => navigate('/onboarding', { replace: true }), 600);
    } catch (err) {
      setError('Setup failed: ' + (err.message || 'Try again'));
    } finally { setLoading(false); }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPassword) { setError('Please enter your email/mobile and password'); return; }

    // Rate limit check
    if (lockUntil > Date.now()) {
      setError(`⏳ Too many attempts. Please wait ${Math.ceil((lockUntil - Date.now()) / 1000)} seconds.`);
      return;
    }

    // Secret admin gate — verify against Supabase admin_config table
    const FALLBACK_ADMIN_USER = 'admin@rythusphere.in';
    const FALLBACK_ADMIN_PASS = 'RythuAdmin@2025';
    try {
      const { data: adminCfg } = await supabase
        .from('admin_config')
        .select('admin_username, admin_password')
        .eq('id', 'default')
        .single();
      if (adminCfg && loginId.trim().toLowerCase() === (adminCfg.admin_username || '').toLowerCase() && loginPassword === adminCfg.admin_password) {
        setLoading(false); setError('');
        setAdminRolePicker(true);
        return;
      }
    } catch {
      // admin_config not available — use hardcoded fallback
    }
    // Hardcoded admin fallback
    if (loginId.trim().toLowerCase() === FALLBACK_ADMIN_USER && loginPassword === FALLBACK_ADMIN_PASS) {
      setLoading(false); setError('');
      setAdminRolePicker(true);
      return;
    }

    setLoading(true); setError('');
    const email = loginId.includes('@') ? loginId : `${loginId}@rythusphere.in`;

    // Aggressively clear ALL stale auth state before attempting login
    const keysToRemove = Object.keys(localStorage).filter(k =>
      k.startsWith('lock:') || k.includes('auth-token') || k.includes('sb-')
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));

    const attemptLogin = async () => {
      const loginPromise = signInWithPassword(email, loginPassword);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
      return Promise.race([loginPromise, timeoutPromise]);
    };

    try {
      const result = await attemptLogin();
      if (result.success) { setLoginAttempts(0); setPendingRedirect('/dashboard'); return; }
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) { setLockUntil(Date.now() + 30000); setCooldown(30); setError('🔒 Too many failed attempts. Locked for 30 seconds.'); setLoading(false); return; }
      setError(result.error?.includes('Invalid') ? `Invalid credentials. ${5 - newAttempts} attempts remaining.` : (result.error || 'Login failed.'));
    } catch (err) {
      if (err.message === 'timeout') {
        // Auto-retry once after clearing everything again
        Object.keys(localStorage).filter(k => k.startsWith('lock:') || k.includes('sb-')).forEach(k => localStorage.removeItem(k));
        try {
          const retry = await attemptLogin();
          if (retry.success) { setLoginAttempts(0); setPendingRedirect('/dashboard'); return; }
          setLoginAttempts(p => p + 1);
          setError(retry.error || 'Login failed. Please try again.');
        } catch {
          setError('Login timed out. Close ALL other tabs and try again.');
        }
      } else {
        setError('Connection error. Try again.');
      }
    } finally { setLoading(false); }
  };



  const switchMode = (mode) => {
    setStep(mode);
    setError(''); setSuccess('');
    setLoginId(''); setLoginPassword('');
    setNewPassword(''); setFullName(''); setForgotEmail('');
    setOtpPhone(''); setOtpCode(''); setOtpSent(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Enter your email or mobile number'); return; }
    setLoading(true); setError('');
    const email = forgotEmail.includes('@') ? forgotEmail : `${forgotEmail}@rythusphere.in`;
    const result = await resetPassword(email);
    if (result.success) {
      setSuccess('📧 Password reset link sent! Check your email inbox (and spam folder).');
    } else {
      setError(result.error || 'Failed to send reset link. Try again.');
    }
    setLoading(false);
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '#475569' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a' }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .auth-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.08); background: rgba(15,20,35,0.6); color: #e2e8f0; font-size: 0.92rem; box-sizing: border-box; outline: none; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .auth-input:focus { border-color: rgba(16,185,129,0.5); box-shadow: 0 0 0 4px rgba(16,185,129,0.08); background: rgba(15,20,35,0.8); }
        .auth-input::placeholder { color: #475569; }
        .auth-btn-primary { width: 100%; padding: 14px; font-size: 0.95rem; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
        .auth-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(16,185,129,0.35); }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-secondary { width: 100%; padding: 13px; font-size: 0.88rem; font-weight: 600; background: transparent; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: all 0.3s; color: #94a3b8; }
        .auth-btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); color: #e2e8f0; }
        .feature-card { padding: 16px 20px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.5s cubic-bezier(0.4,0,0.2,1); cursor: default; }
        .password-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.1rem; padding: 4px; }
        .password-toggle:hover { color: #94a3b8; }
        .auth-left-panel { display: flex; }
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { min-width: 100% !important; }
        }
      `}</style>

      {/* ═══ LEFT PANEL — Branding & Features ═══ */}
      <div className="auth-left-panel" style={{
        flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '48px 56px',
        background: 'linear-gradient(160deg, #0d1525 0%, #0a1628 30%, #081220 70%, #060e1a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1.5rem',
            boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
          }}>🌾</div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>RythuSphere</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.5px' }}>ANDHRA PRADESH</div>
          </div>
        </Link>

        {/* Tagline */}
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Data-Driven Farming<br />
          <span style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
            for AP Farmers
          </span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 40px', maxWidth: 380 }}>
          24 AI-powered modules — crop advisory, market prices, weather forecasts & more. Built for Andhra Pradesh farmers.
        </p>

        {/* Feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: i === activeFeature ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
              borderColor: i === activeFeature ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
              transform: i === activeFeature ? 'scale(1.02)' : 'scale(1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.5rem', animation: i === activeFeature ? 'float 3s ease-in-out infinite' : 'none' }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: i === activeFeature ? '#10b981' : '#94a3b8' }}>{f.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ n: '47,000+', l: 'Farmers' }, { n: '13', l: 'Districts' }, { n: '24', l: 'Modules' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{s.n}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Auth Form ═══ */}
      <div className="auth-right-panel" style={{
        minWidth: 480, maxWidth: 520, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 52px',
        background: '#0b0f19',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 60%)',
      }}>
        {/* Nav links */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 40 }}>
          <Link to="/home" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>← Home</Link>
          <Link to="/features" style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>Features</Link>
        </div>

        {/* ═══ Google Account Setup ═══ */}
        {googleSetup ? (
          <form onSubmit={handleGoogleSetup} key="google-setup" style={{ animation: 'slide-up 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Complete Your Account</h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 6 }}>
                ✅ Google verified! Set your phone & password for future logins
              </p>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#10b981', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>✅</span> Google verified! Set your name, phone & password to create your account.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
              <input type="text" value={googleName} onChange={e => setGoogleName(e.target.value)} placeholder="Your name" className="auth-input" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📱 Mobile Number *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ padding: '14px 12px', borderRadius: 12, background: 'rgba(15,20,35,0.6)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>+91</div>
                <input type="tel" value={googlePhone} onChange={e => checkGooglePhoneUnique(e.target.value)} placeholder="Enter 10-digit number" maxLength={10} className="auth-input" style={{ flex: 1 }} />
              </div>
              {googlePhoneError && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6, fontWeight: 600 }}>⚠️ {googlePhoneError}</div>}
              {!googlePhoneError && googlePhone.length === 10 && <div style={{ color: '#10b981', fontSize: '0.78rem', marginTop: 6 }}>✅ Number available</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showGooglePwd ? 'text' : 'password'} value={googlePassword} onChange={e => setGooglePassword(e.target.value)} placeholder="Min 6 characters" className="auth-input" style={{ paddingRight: 48 }} />
                <button type="button" className="password-toggle" onClick={() => setShowGooglePwd(!showGooglePwd)}>{showGooglePwd ? '🙈' : '👁️'}</button>
              </div>
              {googlePassword && googlePassword.length < 6 && <div style={{ color: '#f59e0b', fontSize: '0.78rem', marginTop: 6 }}>⚠️ At least 6 characters</div>}
              {googlePassword.length >= 6 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= passwordStrength(googlePassword).level ? passwordStrength(googlePassword).color : 'rgba(255,255,255,0.06)' }} />)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: passwordStrength(googlePassword).color, marginTop: 4 }}>{passwordStrength(googlePassword).label}</div>
                </div>
              )}
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#10b981', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>✅</span> {success}
              </div>
            )}
            <button type="submit" disabled={loading || !googleName.trim() || googlePhone.length !== 10 || googlePassword.length < 6 || !!googlePhoneError} className="auth-btn-primary" style={{
              background: (googlePhone.length === 10 && googlePassword.length >= 6 && !googlePhoneError) ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
              color: (googlePhone.length === 10 && googlePassword.length >= 6) ? '#fff' : '#475569',
              boxShadow: (googlePhone.length === 10 && googlePassword.length >= 6) ? '0 4px 20px rgba(16,185,129,0.25)' : 'none',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? '⏳ Setting up...' : '🚀 Create Account & Continue'}
            </button>
          </form>
        ) : (
        <>
        <div style={{ display: 'flex', gap: 6, padding: 5, background: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => switchMode('new')} style={{
            flex: 1, padding: '14px 8px', fontSize: '0.85rem', fontWeight: 700,
            background: step === 'new' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))' : 'transparent',
            color: step === 'new' ? '#10b981' : '#64748b',
            border: step === 'new' ? '1.5px solid rgba(16,185,129,0.25)' : '1.5px solid transparent',
            borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s',
          }}>🌱 New User</button>
          <button onClick={() => switchMode('returning')} style={{
            flex: 1, padding: '14px 8px', fontSize: '0.85rem', fontWeight: 700,
            background: step === 'returning' ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.08))' : 'transparent',
            color: step === 'returning' ? '#a78bfa' : '#64748b',
            border: step === 'returning' ? '1.5px solid rgba(139,92,246,0.25)' : '1.5px solid transparent',
            borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s',
          }}>👋 Welcome Back</button>
        </div>

        {/* Google Sign-In — always visible */}
        <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{
          width: '100%', padding: '13px', fontSize: '0.88rem', fontWeight: 700,
          background: '#fff', color: '#1f2937', border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Title */}
        <div key={step} style={{ marginBottom: 20, animation: 'slide-up 0.4s ease' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            {step === 'forgot' ? '🔑 Reset Password' : step === 'new' ? '🌱 Create Your Account' : '👋 Welcome Back, Farmer!'}
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.84rem' }}>
            {step === 'forgot' ? 'Enter your email or mobile to receive a reset link'
              : step === 'new' ? 'Sign up with Google or Phone OTP'
              : 'Sign in with your credentials'}
          </p>
        </div>

        {/* ── Password Login Form ── */}
        {step === 'returning' && (
          <form onSubmit={handlePasswordLogin} key="password-form" style={{ animation: 'slide-up 0.4s ease' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email or Mobile Number
              </label>
              <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                placeholder="email@example.com or 10-digit mobile" className="auth-input" autoComplete="username"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password" className="auth-input" style={{ paddingRight: 48 }} autoComplete="current-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                  {showLoginPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button type="button" onClick={() => switchMode('forgot')} style={{
                  background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.8rem', cursor: 'pointer',
                  fontWeight: 600, padding: 0, textDecoration: 'underline', opacity: 0.85,
                }}>🔑 Forgot Password?</button>
              </div>
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⚠️</span> {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="auth-btn-primary" style={{
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
              boxShadow: '0 4px 20px rgba(16,185,129,0.25)', opacity: loading ? 0.7 : 1, marginBottom: 12,
            }}>
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>
        )}

        {/* ── Phone OTP Login ── */}
        {step === 'otp' && (
          <div key="otp-form" style={{ animation: 'slide-up 0.4s ease' }}>
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📱 Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ padding: '14px 12px', borderRadius: 12, background: 'rgba(15,20,35,0.6)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>+91</div>
                    <input type="tel" value={otpPhone} onChange={e => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number" maxLength={10} className="auth-input" style={{ flex: 1 }} autoFocus
                    />
                  </div>
                  {otpPhone.length === 10 && /^[6-9]/.test(otpPhone) && (
                    <div style={{ color: '#10b981', fontSize: '0.78rem', marginTop: 6 }}>✅ Valid number</div>
                  )}
                </div>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}
                <button type="submit" disabled={loading || otpPhone.length !== 10} className="auth-btn-primary" style={{
                  background: otpPhone.length === 10 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
                  color: otpPhone.length === 10 ? '#fff' : '#475569',
                  boxShadow: otpPhone.length === 10 ? '0 4px 20px rgba(59,130,246,0.25)' : 'none',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? '⏳ Sending OTP...' : '📲 Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '12px 16px', color: '#60a5fa', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>📲</span> OTP sent to +91 {otpPhone}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔢 Enter 6-Digit OTP
                  </label>
                  <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter OTP from SMS" maxLength={6} className="auth-input"
                    style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '8px', fontWeight: 700 }} autoFocus
                  />
                </div>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}
                {success && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#10b981', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>✅</span> {success}
                  </div>
                )}
                <button type="submit" disabled={loading || otpCode.length !== 6} className="auth-btn-primary" style={{
                  background: otpCode.length === 6 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                  color: otpCode.length === 6 ? '#fff' : '#475569',
                  boxShadow: otpCode.length === 6 ? '0 4px 20px rgba(16,185,129,0.25)' : 'none',
                  opacity: loading ? 0.7 : 1, marginBottom: 12,
                }}>
                  {loading ? '⏳ Verifying...' : '✅ Verify OTP & Sign In'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }} style={{
                    background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', padding: 0,
                  }}>← Change Number</button>
                  <button type="button" onClick={handleSendOTP} disabled={otpCountdown > 0 || loading} style={{
                    background: 'none', border: 'none', color: otpCountdown > 0 ? '#475569' : '#3b82f6',
                    fontSize: '0.82rem', cursor: otpCountdown > 0 ? 'default' : 'pointer', fontWeight: 600, padding: 0,
                  }}>
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : '🔄 Resend OTP'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── New User (Google + Phone OTP signup) ── */}
        {step === 'new' && (
          <div key="new-user-info" style={{ animation: 'slide-up 0.4s ease' }}>
            <div style={{
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 16, padding: '24px', marginBottom: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌾</div>
              <h3 style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
                Join RythuSphere Today
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                Sign up with <strong style={{ color: '#e2e8f0' }}>Google</strong> above, or use <strong style={{ color: '#60a5fa' }}>Phone OTP</strong> below.
              </p>
            </div>

            {/* Phone OTP Signup Section */}
            <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                📱 Sign Up with Phone OTP
              </div>
              {!otpSent && !otpVerified && (
                <form onSubmit={handleSendOTP}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ padding: '12px 10px', borderRadius: 10, background: 'rgba(15,20,35,0.6)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.88rem' }}>+91</div>
                      <input type="tel" value={otpPhone} onChange={e => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number" maxLength={10} className="auth-input" style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: '0.8rem', marginBottom: 12 }}>⚠️ {error}</div>}
                  <button type="submit" disabled={loading || otpPhone.length !== 10} className="auth-btn-primary" style={{
                    background: otpPhone.length === 10 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.05)',
                    color: otpPhone.length === 10 ? '#fff' : '#475569',
                    opacity: loading ? 0.7 : 1, fontSize: '0.85rem',
                  }}>
                    {loading ? '⏳ Sending...' : '📲 Send OTP'}
                  </button>
                </form>
              )}
              {otpSent && !otpVerified && (
                <form onSubmit={handleVerifyOTP}>
                  <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px', color: '#60a5fa', fontSize: '0.8rem', marginBottom: 14 }}>
                    📲 OTP sent to +91 {otpPhone}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enter 6-Digit OTP</label>
                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000" maxLength={6} className="auth-input"
                      style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '8px', fontWeight: 700 }} autoFocus
                    />
                  </div>
                  {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: '0.8rem', marginBottom: 12 }}>⚠️ {error}</div>}
                  <button type="submit" disabled={loading || otpCode.length !== 6} className="auth-btn-primary" style={{
                    background: otpCode.length === 6 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                    color: otpCode.length === 6 ? '#fff' : '#475569',
                    opacity: loading ? 0.7 : 1, fontSize: '0.85rem', marginBottom: 8,
                  }}>
                    {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>← Change Number</button>
                    <button type="button" onClick={handleSendOTP} disabled={otpCountdown > 0} style={{ background: 'none', border: 'none', color: otpCountdown > 0 ? '#475569' : '#3b82f6', fontSize: '0.78rem', cursor: otpCountdown > 0 ? 'default' : 'pointer', fontWeight: 600, padding: 0 }}>
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : '🔄 Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
              {otpVerified && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!otpFullName.trim()) { setError('Please enter your full name'); return; }
                  if (otpPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
                  setLoading(true); setError('');
                  const res = await updateUserPassword(otpPassword);
                  if (res.success) {
                    await updateProfile({ full_name: otpFullName, phone: otpPhone, role: 'farmer' });
                    setSuccess('Account created! Redirecting...');
                    setPendingRedirect('/onboarding');
                  } else { setError(res.error || 'Failed to set password'); }
                  setLoading(false);
                }}>
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', color: '#10b981', fontSize: '0.8rem', marginBottom: 14 }}>
                    ✅ Phone +91 {otpPhone} verified! Set up your account below.
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                    <input type="text" value={otpFullName} onChange={e => setOtpFullName(e.target.value)}
                      placeholder="Enter your full name" className="auth-input" autoFocus
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showOtpPassword ? 'text' : 'password'} value={otpPassword} onChange={e => setOtpPassword(e.target.value)}
                        placeholder="Min 6 characters" className="auth-input"
                      />
                      <button type="button" onClick={() => setShowOtpPassword(!showOtpPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {showOtpPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: '0.8rem', marginBottom: 12 }}>⚠️ {error}</div>}
                  {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', color: '#10b981', fontSize: '0.8rem', marginBottom: 12 }}>✅ {success}</div>}
                  <button type="submit" disabled={loading || !otpFullName.trim() || otpPassword.length < 6} className="auth-btn-primary" style={{
                    background: (otpFullName.trim() && otpPassword.length >= 6) ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                    color: (otpFullName.trim() && otpPassword.length >= 6) ? '#fff' : '#475569',
                    opacity: loading ? 0.7 : 1, fontSize: '0.85rem',
                  }}>
                    {loading ? '⏳ Creating...' : '🚀 Create Account & Continue'}
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['✅ Free 6-month trial for farmers', '✅ 24 AI-powered modules', '✅ Telugu, Hindi & English support', '✅ Andhra Pradesh focused'].map((item, i) => (
                <div key={i} style={{ color: '#94a3b8', fontSize: '0.84rem', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Forgot Password Form ── */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword} key="forgot-form" style={{ animation: 'slide-up 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔑</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Reset Your Password</h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 6 }}>Enter your email or mobile and we'll send a reset link</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email or Mobile Number
              </label>
              <input type="text" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                placeholder="email@example.com or 10-digit mobile" className="auth-input"
              />
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#10b981', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>✅</span> {success}
              </div>
            )}
            <button type="submit" disabled={loading} className="auth-btn-primary" style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
              boxShadow: '0 4px 20px rgba(245,158,11,0.25)', opacity: loading ? 0.7 : 1, marginBottom: 12,
            }}>
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </button>
            <button type="button" onClick={() => switchMode('returning')} className="auth-btn-secondary" style={{ marginTop: 8 }}>
              ← Back to Login
            </button>
          </form>
        )}

        </>
        )}

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {['🔒 Secure', '🌐 తెలుగు', '📱 Mobile Ready'].map((b, i) => (
            <span key={i} style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>{b}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#334155', marginTop: 8 }}>
          🌾 RythuSphere v1.0 · India's #1 Smart Farming Platform
          <br />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <Link to="/about" style={{ color: '#475569', textDecoration: 'none' }}>About</Link>
            <Link to="/pricing" style={{ color: '#475569', textDecoration: 'none' }}>Pricing</Link>
            <Link to="/contact-us" style={{ color: '#475569', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>

      {/* Admin Role Picker Modal */}
      {adminRolePicker && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: 560, maxWidth: '94vw', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 24, padding: '36px 32px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛡️</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
                Admin Access Granted
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6 }}>
                Select a role to view the platform as that user type
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { role: 'admin', icon: '🛡️', label: 'Admin', desc: 'Full control panel', color: '#ef4444', path: '/admin' },
                { role: 'farmer', icon: '🌾', label: 'Farmer', desc: 'Crop, weather, market', color: '#22c55e', path: '/dashboard' },
                { role: 'industrial', icon: '🏭', label: 'Industrial', desc: 'Bulk orders & procurement', color: '#3b82f6', path: '/industrial-dashboard' },
                { role: 'broker', icon: '🤝', label: 'Broker', desc: 'Trade & commission', color: '#f59e0b', path: '/broker-dashboard' },
                { role: 'supplier', icon: '🏪', label: 'Supplier', desc: 'Input store & sales', color: '#8b5cf6', path: '/supplier-dashboard' },
                { role: 'customer', icon: '🛍️', label: 'Customer', desc: 'Buy farm produce', color: '#06b6d4', path: '/customer-dashboard' },
                { role: 'labour', icon: '👷', label: 'Labour', desc: 'Job listings & hire', color: '#f97316', path: '/labour-dashboard' },
              ].map(r => (
                <button key={r.role} onClick={async () => {
                  // Clear real Supabase session so demo role is not overridden on reload
                  Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token')).forEach(k => localStorage.removeItem(k))
                  demoLogin(r.role);
                  localStorage.setItem('agri_admin_token', 'admin_authenticated');
                  localStorage.setItem('rythu_user_role', r.role);
                  localStorage.setItem('agri360_admin_viewing_as', r.role);
                  localStorage.setItem('agri360_is_admin_session', 'true');
                  localStorage.setItem('agri360_onboarding_complete', 'true');
                  localStorage.setItem('rythusphere_onboarding_complete', 'true');
                  localStorage.setItem('agri360_payments', JSON.stringify({ role: r.role, status: 'verified' }));
                  setAdminRolePicker(false);
                  setSuccess(`✅ Viewing as ${r.label}...`);
                  setTimeout(() => { window.location.href = r.path; }, 300);
                }} style={{
                  padding: '18px 12px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.25s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = r.color + '18'; e.currentTarget.style.borderColor = r.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${r.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '1.8rem' }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: r.color }}>{r.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4 }}>{r.desc}</div>
                </button>
              ))}
            </div>

            <button onClick={() => setAdminRolePicker(false)} style={{
              width: '100%', padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            }}>✕ Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
