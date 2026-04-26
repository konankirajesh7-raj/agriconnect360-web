import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { sendOTP as sendSMSOTP, verifyOTP as verifySMSOTP } from '../lib/smsService';

const FEATURES = [
  { icon: '🌾', title: 'Smart Crop Advisory', desc: 'AI-powered recommendations in Telugu' },
  { icon: '📊', title: 'Live Market Prices', desc: 'Real-time mandi rates for 20+ crops' },
  { icon: '🌦️', title: 'Weather Intelligence', desc: '7-day hyper-local AP forecasts' },
  { icon: '💰', title: 'Financial Services', desc: 'KCC tracking, loans & insurance' },
];

export default function LoginPage() {
  const [step, setStep] = useState('new'); // 'new' | 'returning' | 'forgot'
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
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
  const [demoRoleOpen, setDemoRoleOpen] = useState(false);

  const [pendingRedirect, setPendingRedirect] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithPassword, signInWithGoogle, demoLogin, signUp, isAuthenticated, loading: authLoading, resetPassword, updateUserPassword, user, updateProfile } = useAuth();

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
        const onbStatus = localStorage.getItem('agri360_onboarding_complete');
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

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) { const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000); return () => clearTimeout(t); }
  }, [otpTimer]);

  const handleSendOTP = async () => {
    if (mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number'); return;
    }
    // Check if this number is already registered
    const registered = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
    if (registered.includes(mobile)) {
      setError(`📱 This number is already registered! Please use the 🔐 Password tab to sign in.`);
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const result = await sendSMSOTP(mobile, 'en');
      if (result.success) {
        setOtpSent(true); setOtpTimer(30);
        setSuccess(result.mock
          ? `OTP sent (test mode). Check console for OTP.`
          : `OTP sent to +91-${mobile}. Check your SMS.`);
      } else {
        setError(result.error || 'Failed to send OTP. Try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError(''); setSuccess('');
    const result = verifySMSOTP(mobile, otp);
    if (result.success) {
      // OTP verified — new user, show password setup
      setOtpVerified(true);
      setSuccess('✅ Mobile verified! Set your name & password to create your account.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCreateAccountAfterOTP = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your name'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const mobileEmail = `${mobile}@agriconnect360.in`;
    try {
      const result = await signUp(mobileEmail, newPassword, {
        full_name: fullName, role: 'farmer', phone: mobile,
      });
      if (result.success) {
        // Save to localStorage so we know this number is registered
        const reg = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
        if (!reg.includes(mobile)) { reg.push(mobile); localStorage.setItem('ac360_registered_users', JSON.stringify(reg)); }
        setSuccess('✅ Account created! Redirecting...');
        // /onboarding is a public route — navigate directly, auth session from signUp will propagate
        setTimeout(() => navigate('/onboarding', { replace: true }), 600);
      } else {
        const errMsg = result.error || '';
        if (errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('exists') || errMsg.toLowerCase().includes('registered')) {
          // User already exists — save to localStorage and redirect to Password tab
          const reg = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
          if (!reg.includes(mobile)) { reg.push(mobile); localStorage.setItem('ac360_registered_users', JSON.stringify(reg)); }
          setError('This number is already registered. Switching to Password login...');
          setTimeout(() => { switchMode('password'); setLoginId(mobile); }, 1500);
        } else {
          setError(errMsg || 'Registration failed. Please try again.');
        }
      }
    } catch (err) { setError('Error creating account. Please try again.'); }
    finally { setLoading(false); }
  };

  const DEMO_ROLES = [
    { id: 'farmer', icon: '👨‍🌾', label: 'Farmer', color: '#10b981', dash: '/dashboard' },
    { id: 'industrial', icon: '🏭', label: 'Industrial Buyer', color: '#3b82f6', dash: '/industrial-dashboard' },
    { id: 'broker', icon: '🤝', label: 'Broker / Trader', color: '#f59e0b', dash: '/broker-dashboard' },
    { id: 'supplier', icon: '🏪', label: 'Supplier', color: '#8b5cf6', dash: '/supplier-dashboard' },
    { id: 'labour', icon: '👷', label: 'Labour', color: '#ef4444', dash: '/labour-dashboard' },
    { id: 'admin', icon: '🛡️', label: 'Admin (All Access)', color: '#06b6d4', dash: '/dashboard' },
  ];

  const handleDemoLogin = (role = 'farmer') => {
    const r = DEMO_ROLES.find(d => d.id === role) || DEMO_ROLES[0];
    demoLogin(role);
    setDemoRoleOpen(false);
    navigate(r.dash);
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    const result = await signInWithGoogle();
    if (!result.success) setError(result.error || 'Google sign-in failed. Try Mobile OTP.');
    setLoading(false);
  };

  const checkGooglePhoneUnique = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setGooglePhone(clean);
    if (clean.length === 10) {
      const reg = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
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
      const reg = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
      if (!reg.includes(googlePhone)) { reg.push(googlePhone); localStorage.setItem('ac360_registered_users', JSON.stringify(reg)); }
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
    setLoading(true); setError('');
    const email = loginId.includes('@') ? loginId : `${loginId}@agriconnect360.in`;

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
      if (result.success) { setPendingRedirect('/dashboard'); return; }
      setError(result.error?.includes('Invalid') ? 'Invalid credentials. Check your mobile and password.' : (result.error || 'Login failed.'));
    } catch (err) {
      if (err.message === 'timeout') {
        // Auto-retry once after clearing everything again
        Object.keys(localStorage).filter(k => k.startsWith('lock:') || k.includes('sb-')).forEach(k => localStorage.removeItem(k));
        try {
          const retry = await attemptLogin();
          if (retry.success) { setPendingRedirect('/dashboard'); return; }
          setError(retry.error || 'Login failed. Please try again.');
        } catch {
          setError('Login timed out. Close ALL other tabs and try again, or use Mobile OTP.');
        }
      } else {
        setError('Connection error. Try again.');
      }
    } finally { setLoading(false); }
  };



  const switchMode = (mode) => {
    setStep(mode);
    setError(''); setSuccess('');
    setOtpSent(false); setOtp(''); setOtpVerified(false);
    setLoginId(''); setLoginPassword('');
    setNewPassword(''); setFullName(''); setForgotEmail('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Enter your email or mobile number'); return; }
    setLoading(true); setError('');
    const email = forgotEmail.includes('@') ? forgotEmail : `${forgotEmail}@agriconnect360.in`;
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
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>AgriConnect 360</div>
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
        {/* Mode tabs — New User / Welcome Back */}
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
        <div key={step + (otpVerified ? '-verified' : '')} style={{ marginBottom: 20, animation: 'slide-up 0.4s ease' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            {step === 'forgot' ? '🔑 Reset Password' : step === 'new' && !otpVerified ? '🌱 Create Your Account' : step === 'new' && otpVerified ? '🔐 Set Your Password' : '👋 Welcome Back, Farmer!'}
          </h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: '0.84rem' }}>
            {step === 'forgot' ? 'Enter your email or mobile to receive a reset link'
              : step === 'new' && !otpVerified ? 'Verify your mobile via OTP or sign in with Google'
              : step === 'new' && otpVerified ? 'Create your password for future logins'
              : 'Sign in with your mobile number & password'}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <button type="button" onClick={() => setDemoRoleOpen(!demoRoleOpen)} className="auth-btn-secondary" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
              color: '#a78bfa', borderColor: 'rgba(139,92,246,0.15)', position: 'relative',
            }}>
              🚀 Explore Demo — Choose Role ▾
            </button>
            {demoRoleOpen && (
              <div style={{ marginTop: 8, background: 'rgba(15,20,35,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {DEMO_ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => handleDemoLogin(r.id)} style={{
                    padding: '10px 12px', background: `${r.color}10`, border: `1px solid ${r.color}30`,
                    borderRadius: 10, cursor: 'pointer', color: r.color, fontSize: '0.78rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{r.icon}</span> {r.label}
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {/* ── OTP Form (New User) ── */}
        {step === 'new' && (
          <form onSubmit={otpVerified ? handleCreateAccountAfterOTP : handleVerifyOTP} key="otp-form" style={{ animation: 'slide-up 0.4s ease' }}>
            {!otpSent && !otpVerified ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ padding: '14px 12px', borderRadius: 12, background: 'rgba(15,20,35,0.6)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>+91</div>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number" maxLength={10} className="auth-input" style={{ flex: 1 }}
                    />
                  </div>
                </div>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span> {error}
                  </div>
                )}
                <button type="button" onClick={handleSendOTP} disabled={loading || mobile.length !== 10} className="auth-btn-primary" style={{
                  background: mobile.length === 10 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                  color: mobile.length === 10 ? '#fff' : '#475569',
                  boxShadow: mobile.length === 10 ? '0 4px 20px rgba(245,158,11,0.25)' : 'none',
                  opacity: loading ? 0.7 : 1, marginBottom: 12,
                }}>
                  {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
                </button>
              </>
            ) : otpSent && !otpVerified ? (
              <>
                {success && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#34d399', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>✅</span> {success}
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Enter 6-Digit OTP
                  </label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="● ● ● ● ● ●" maxLength={6} autoFocus className="auth-input"
                    style={{ textAlign: 'center', letterSpacing: '10px', fontSize: '1.4rem', fontWeight: 700, padding: '16px' }}
                  />
                </div>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span> {error}
                  </div>
                )}
                <button type="submit" disabled={loading || otp.length !== 6} className="auth-btn-primary" style={{
                  background: otp.length === 6 ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                  color: otp.length === 6 ? '#fff' : '#475569',
                  boxShadow: otp.length === 6 ? '0 4px 20px rgba(16,185,129,0.25)' : 'none',
                  opacity: loading ? 0.7 : 1, marginBottom: 12,
                }}>
                  {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                </button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); setSuccess(''); }}
                  className="auth-btn-secondary" style={{ marginBottom: 8 }}>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : '🔄 Resend OTP'}
                </button>
              </>
            ) : (
              /* OTP Verified — Set Password to complete registration */
              <>
                {success && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', color: '#34d399', fontSize: '0.84rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>✅</span> {success}
                  </div>
                )}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Rajesh Kumar" className="auth-input" autoComplete="name" autoFocus
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters" className="auth-input" style={{ paddingRight: 48 }} autoComplete="new-password"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {newPassword && (() => { const s = passwordStrength(newPassword); return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= s.level ? s.color : 'rgba(255,255,255,0.06)', transition: 'all 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600 }}>{s.label}</div>
                  </div>
                );})()}
                {!newPassword && <div style={{ marginBottom: 20 }} />}
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: '0.84rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="auth-btn-primary" style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.25)', opacity: loading ? 0.7 : 1, marginBottom: 12,
                }}>
                  {loading ? '⏳ Creating Account...' : '🚀 Create Account & Continue'}
                </button>
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <button type="button" onClick={() => setDemoRoleOpen(!demoRoleOpen)} className="auth-btn-secondary" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
              color: '#a78bfa', borderColor: 'rgba(139,92,246,0.15)', position: 'relative',
            }}>
              🚀 Explore Demo — Choose Role ▾
            </button>
            {demoRoleOpen && (
              <div style={{ marginTop: 8, background: 'rgba(15,20,35,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {DEMO_ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => handleDemoLogin(r.id)} style={{
                    padding: '10px 12px', background: `${r.color}10`, border: `1px solid ${r.color}30`,
                    borderRadius: 10, cursor: 'pointer', color: r.color, fontSize: '0.78rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{r.icon}</span> {r.label}
                  </button>
                ))}
              </div>
            )}
          </form>
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
          🌾 AgriConnect 360 v1.0 · India's #1 Smart Farming Platform
          <br />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <Link to="/about" style={{ color: '#475569', textDecoration: 'none' }}>About</Link>
            <Link to="/pricing" style={{ color: '#475569', textDecoration: 'none' }}>Pricing</Link>
            <Link to="/contact-us" style={{ color: '#475569', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
