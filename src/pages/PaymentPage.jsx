import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const DEFAULT_CFG = { upiId:'6303369360@mbk', phone:'6303369360', merchantName:'RythuSphere', couponCode:'AGRI360FREE', trialDays:180, farmerPrice:50, othersPrice:100 };
function getPlanForRole(role, cfg) {
  if (role === 'farmer') return { id:'farmer-plan', name:'Farmer Plan', price:cfg?.farmerPrice||50, period:'/ 6 months', features:['Full Dashboard & Analytics','AI Crop Advisory','Live Market Prices','Weather Intelligence','Gov Schemes & Subsidies','Equipment & Transport Booking','Community & Network','Marketplace Access'], color:'#10b981' };
  if (role === 'customer') return { id:'customer-plan', name:'Customer Plan', price:0, period:'/ free', features:['Browse & Buy Produce','Supplier Access','Machinery & Equipment','Live Market Prices','Weather Intelligence','Community & Network','Marketplace Access','AI Assistant'], color:'#ec4899' };
  return { id:'others-plan', name:'Professional Plan', price:cfg?.othersPrice||100, period:'/ 6 months', features:['Full Dashboard & Analytics','AI Business Assistant','Live Market Prices','Weather Intelligence','Transport & Cold Storage','Equipment Booking','Community & Network','Marketplace Access','Broker/Supplier Tools'], color:'#8b5cf6' };
}
const STATUS_COLORS = { pending:'#f59e0b', verified:'#10b981', rejected:'#ef4444' };
const S = {
  card: { background:'rgba(255,255,255,0.03)', borderRadius:16, padding:'18px 16px', border:'1px solid rgba(255,255,255,0.06)' },
  inp: { width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'0.88rem', boxSizing:'border-box', outline:'none' },
  btn: (bg) => ({ width:'100%', padding:'13px', borderRadius:12, border:'none', background:bg, color:'#fff', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }),
};

async function loadCfg() {
  try {
    const { data } = await supabase.from('payment_config').select('*').eq('id','default').single();
    if (data) return { ...DEFAULT_CFG, upiId:data.upi_id||DEFAULT_CFG.upiId, phone:data.phone||DEFAULT_CFG.phone, merchantName:data.merchant_name||DEFAULT_CFG.merchantName, couponCode:data.coupon_code||DEFAULT_CFG.couponCode, trialDays:data.trial_days||DEFAULT_CFG.trialDays, farmerPrice:data.farmer_price??50, othersPrice:data.others_price??100 };
  } catch {}
  try { const s=localStorage.getItem('rythu_payment_config'); if(s) return {...DEFAULT_CFG,...JSON.parse(s)}; } catch {}
  return DEFAULT_CFG;
}

//  Trial Tracker Component 
function TrialTracker({ user }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    const key = `rythu_trial_${user.id}`;
    let startDate = localStorage.getItem(key);
    if (!startDate) { startDate = new Date().toISOString(); localStorage.setItem(key, startDate); }
    const start = new Date(startDate);
    const end = new Date(start); end.setDate(end.getDate() + 180);
    const now = new Date();
    const totalMs = end - start;
    const elapsedMs = now - start;
    const remainMs = Math.max(0, end - now);
    const remainDays = Math.ceil(remainMs / (1000*60*60*24));
    const pct = Math.min(100, (elapsedMs / totalMs) * 100);
    setInfo({ remainDays, pct, expired: remainDays <= 0, startDate: start.toLocaleDateString(), endDate: end.toLocaleDateString() });
  }, [user]);
  if (!info) return null;
  const barColor = info.remainDays > 60 ? '#10b981' : info.remainDays > 14 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ ...S.card, border:`1px solid ${barColor}33`, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.3rem' }}>{info.expired ? '⏰' : '🟢'}</span>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:'0.9rem' }}>{info.expired ? 'Free Trial Expired' : 'Free Trial Active'}</div>
            <div style={{ color:'#64748b', fontSize:'0.7rem' }}>{info.startDate} → {info.endDate}</div>
          </div>
        </div>
        <div style={{ background:`${barColor}20`, padding:'4px 12px', borderRadius:10 }}>
          <span style={{ color:barColor, fontWeight:800, fontSize:'1rem' }}>{info.remainDays}</span>
          <span style={{ color:'#64748b', fontSize:'0.65rem', marginLeft:3 }}>days left</span>
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:6, height:8, overflow:'hidden' }}>
        <div style={{ width:`${info.pct}%`, height:'100%', background:barColor, borderRadius:6, transition:'width 0.5s' }} />
      </div>
      {info.remainDays <= 14 && !info.expired && <div style={{ color:'#f59e0b', fontSize:'0.72rem', marginTop:8, fontWeight:600 }}>⚠ Your trial expires soon! Upgrade to keep premium features.</div>}
      {info.expired && <div style={{ color:'#ef4444', fontSize:'0.72rem', marginTop:8, fontWeight:600 }}>Your trial has ended. Subscribe to continue using premium features.</div>}
    </div>
  );
}

//  Coupon Code Section 
function CouponSection({ user, config, onApplied }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const a = localStorage.getItem(`rythu_coupon_${user.id}`);
      if (a) setApplied(true);
    }
  }, [user]);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setMsg('⚠️ Please enter a coupon code.'); setTimeout(() => setMsg(''), 4000); return; }
    setLoading(true);

    const validCode = (config.couponCode || 'RYTHUFREE').toUpperCase();
    if (trimmed !== validCode) {
      setMsg('❌ Invalid coupon code. Please check and try again.');
      setLoading(false);
      setTimeout(() => setMsg(''), 5000);
      return;
    }

    // Check if already used (localStorage quick check)
    if (localStorage.getItem(`rythu_coupon_${user?.id}`)) {
      setMsg('⚠️ You have already applied a coupon. Each account gets one free trial only.');
      setApplied(true);
      setLoading(false);
      setTimeout(() => setMsg(''), 5000);
      return;
    }

    // Save coupon application —goes through same flow as payment (admin verification)
    const couponPayment = {
      user_id: user?.id || 'anon',
      user_name: user?.user_metadata?.full_name || user?.email || 'User',
      user_email: user?.email || '',
      plan_id: 'trial',
      plan_name: '6-Month Free Trial (Coupon)',
      amount: 0,
      txn_id: `COUPON-${trimmed}`,
      payment_method: 'coupon',
      status: 'verified',
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save to localStorage immediately
    localStorage.setItem(`rythu_coupon_${user?.id}`, JSON.stringify({ code: trimmed, appliedAt: new Date().toISOString(), trialDays: config.trialDays || 180 }));
    const key = `rythu_trial_${user?.id}`;
    if (!localStorage.getItem(key)) localStorage.setItem(key, new Date().toISOString());

    // Save to Supabase (best effort)
    try {
      await Promise.race([
        supabase.from('subscription_payments').insert(couponPayment),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
      ]);
    } catch {}

    setApplied(true);
    setLoading(false);
    setMsg('✅ Coupon applied! You now have 6 months FREE access to all premium features.');
    onApplied?.();
    setTimeout(() => setMsg(''), 8000);
  };
  if (applied) return (
    <div style={{ ...S.card, border:'1px solid rgba(16,185,129,0.3)', marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:'1.3rem' }}>✅</span>
        <div>
          <div style={{ color:'#10b981', fontWeight:700, fontSize:'0.85rem' }}>Coupon Applied Successfully</div>
          <div style={{ color:'#64748b', fontSize:'0.7rem' }}>Your subscription is active. Check trial tracker above for details.</div>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ ...S.card, border:'1px solid rgba(139,92,246,0.2)', marginBottom:20 }}>
      <div style={{ color:'#fff', fontWeight:700, fontSize:'0.9rem', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>🎟️ Have a Coupon Code?</div>
      <div style={{ color:'#94a3b8', fontSize:'0.75rem', marginBottom:12 }}>Apply your coupon to get 6 months FREE access to all premium features</div>
      <div style={{ display:'flex', gap:8 }}>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" style={{ ...S.inp, flex:1, textTransform:'uppercase', letterSpacing:'2px', fontWeight:700 }} />
        <button onClick={handleApply} disabled={loading} style={{ padding:'12px 20px', borderRadius:10, border:'none', background: loading ? '#475569' : 'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor: loading ? 'wait' : 'pointer', whiteSpace:'nowrap', opacity: loading ? 0.7 : 1 }}>{loading ? '⏳ Applying...' : 'Apply'}</button>
      </div>
      {msg && <div style={{ marginTop:10, padding:'8px 12px', borderRadius:8, background: msg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : msg.startsWith('⚠️') ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: msg.startsWith('✅') ? '#10b981' : msg.startsWith('⚠️') ? '#f59e0b' : '#ef4444', fontSize:'0.78rem', fontWeight:600 }}>{msg}</div>}
    </div>
  );
}

//  Payment Modal 
function PaymentModal({ plan, config, onClose, onSubmit }) {
  const [txnId, setTxnId] = useState('');
  const [method, setMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const upiLink = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent(config.merchantName)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(`RythuSphere ${plan.name}`)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&bgcolor=0a1628&color=10b981&format=png`;
  const doSubmit = async () => {
    if(!txnId.trim()||txnId.trim().length<4) return;
    setSubmitting(true);
    try {
      await onSubmit(txnId.trim());
    } catch (err) {
      console.warn('Payment submit error:', err);
      // Still close modal —payment was saved to localStorage as fallback
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', padding:16 }} onClick={onClose}>
      <div style={{ maxWidth:400, width:'100%', background:'#0f1d32', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)', padding:'24px 20px', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, color:'#fff', fontSize:'1.1rem' }}>{step===1?'💳 Make Payment':'✅ Confirm Payment'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ background:'rgba(16,185,129,0.1)', borderRadius:12, padding:14, border:'1px solid rgba(16,185,129,0.2)', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div><div style={{ color:'#10b981', fontWeight:700 }}>{plan.name}</div><div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>{plan.period}</div></div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'1.3rem' }}>₹{plan.price}</div>
          </div>
        </div>
        {step===1 ? <>
          <div style={{ marginBottom:16 }}>
            <div style={{ color:'#94a3b8', fontSize:'0.75rem', fontWeight:600, marginBottom:8 }}>PAY VIA</div>
            {[{id:'upi',l:'📱 UPI (GPay / PhonePe / Paytm)',d:'Instant'},{id:'qr',l:'📱 Scan QR Code',d:'Any UPI app'},{id:'phone',l:'📞 Pay to Phone',d:config.phone}].map(m=>(
              <button key={m.id} onClick={()=>setMethod(m.id)} style={{ width:'100%', padding:'12px 14px', borderRadius:10, marginBottom:8, background:method===m.id?'rgba(16,185,129,0.15)':'rgba(255,255,255,0.03)', border:`1px solid ${method===m.id?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.08)'}`, color:'#fff', textAlign:'left', cursor:'pointer', boxSizing:'border-box' }}>
                <div style={{ fontWeight:600, fontSize:'0.82rem' }}>{m.l}</div><div style={{ color:'#64748b', fontSize:'0.7rem' }}>{m.d}</div>
              </button>
            ))}
          </div>
          {method==='qr' && <div style={{ textAlign:'center', marginBottom:16 }}><div style={{ background:'#0f1d32', borderRadius:16, padding:16, border:'2px solid rgba(16,185,129,0.3)', display:'inline-block' }}><img src={qrUrl} alt="QR" width={180} height={180} style={{ borderRadius:8 }} onError={e=>{e.target.style.display='none'}} /></div><div style={{ marginTop:8, fontSize:'0.72rem', color:'#64748b' }}>Scan with any UPI app</div></div>}
          {method==='upi' && <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:14, border:'1px solid rgba(255,255,255,0.08)', marginBottom:16, textAlign:'center' }}>
            <div style={{ color:'#94a3b8', fontSize:'0.7rem', marginBottom:6 }}>UPI ID</div>
            <div style={{ color:'#10b981', fontWeight:700, fontSize:'1rem', fontFamily:'monospace', background:'rgba(16,185,129,0.1)', padding:'8px 12px', borderRadius:8, display:'inline-block' }}>{config.upiId}</div>
            <button onClick={()=>navigator.clipboard?.writeText(config.upiId)} style={{ display:'block', margin:'10px auto 0', padding:'6px 16px', borderRadius:8, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', fontSize:'0.72rem', cursor:'pointer', fontWeight:600 }}>📋 Copy UPI ID</button>
            <a href={upiLink} style={{ display:'block', margin:'10px auto 0', padding:'10px 20px', borderRadius:10, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontWeight:700, fontSize:'0.82rem', textDecoration:'none' }}>📱 Open UPI App & Pay ₹{plan.price}</a>
          </div>}
          {method==='phone' && <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:14, textAlign:'center', marginBottom:16 }}>
            <div style={{ color:'#94a3b8', fontSize:'0.7rem', marginBottom:6 }}>Send money to</div>
            <div style={{ color:'#f59e0b', fontWeight:700, fontSize:'1.3rem', fontFamily:'monospace' }}>{config.phone}</div>
            <div style={{ color:'#64748b', fontSize:'0.7rem', marginTop:4 }}>Amount: ₹{plan.price}</div>
          </div>}
          <button onClick={()=>setStep(2)} style={S.btn('linear-gradient(135deg,#10b981,#059669)')}>✅ I've Made the Payment →</button>
        </> : <>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', color:'#94a3b8', fontSize:'0.75rem', fontWeight:600, marginBottom:8 }}>ENTER TRANSACTION ID / UTR NUMBER</label>
            <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="e.g. 412345678901" style={{ ...S.inp, fontSize:'1rem', letterSpacing:'1px', fontFamily:'monospace' }} />
            <div style={{ color:'#64748b', fontSize:'0.68rem', marginTop:6 }}>Find this in your UPI app payment history</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setStep(1)} style={{ ...S.btn('rgba(255,255,255,0.06)'), flex:'0 0 auto', width:'auto', padding:'13px 20px' }}>⬅ Back</button>
            <button onClick={doSubmit} disabled={submitting||!txnId.trim()||txnId.trim().length<4} style={{ ...S.btn(txnId.trim().length>=4?'linear-gradient(135deg,#10b981,#059669)':'rgba(255,255,255,0.06)'), flex:1, opacity:txnId.trim().length>=4?1:0.5 }}>{submitting?'Submitting...':'Submit for Verification'}</button>
          </div>
        </>}
      </div>
    </div>
  );
}

//  My Payments History 
function MyPayments({ payments }) {
  if (!payments.length) return null;
  return (
    <div style={{ marginTop:24 }}>
      <div style={{ color:'#94a3b8', fontSize:'0.78rem', fontWeight:600, marginBottom:10 }}>📋 Payment History</div>
      {payments.map(p => (
        <div key={p.id} style={{ ...S.card, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'#e2e8f0', fontWeight:600, fontSize:'0.82rem' }}>{p.plan_name} —₹{p.amount}</div>
            <div style={{ color:'#64748b', fontSize:'0.68rem' }}>TXN: {p.txn_id} · {new Date(p.created_at).toLocaleDateString()}</div>
          </div>
          <span style={{ padding:'3px 10px', borderRadius:12, fontSize:'0.65rem', fontWeight:700, background:`${STATUS_COLORS[p.status]}20`, color:STATUS_COLORS[p.status], textTransform:'uppercase' }}>
            {p.status==='pending'?'⏳ Pending':p.status==='verified'?'✅ Verified':'❌ Rejected'}
          </span>
        </div>
      ))}
    </div>
  );
}

//  Main Payment Page 
export default function PaymentPage() {
  const { user, farmerProfile, userRole } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState(DEFAULT_CFG);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [activePlan, setActivePlan] = useState('basic');
  const [successMsg, setSuccessMsg] = useState('');
  const [, forceUpdate] = useState(0);

  useEffect(() => { loadCfg().then(setConfig); }, []);

  // Robust role detection —fetch from Supabase profiles (source of truth)
  const [detectedRole, setDetectedRole] = useState(() => {
    try { const r = localStorage.getItem('rythu_user_role'); if (r) return r; } catch {}
    try { const d = JSON.parse(localStorage.getItem('rythu_onboarding_data') || '{}'); if (d.role) return d.role; } catch {}
    return null;
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data?.role) {
        setDetectedRole(data.role);
        localStorage.setItem('rythu_user_role', data.role);
      }
    }).catch(() => {});
  }, [user]);

  const effectiveRole = detectedRole || farmerProfile?.role || userRole || 'farmer';
  const plan = getPlanForRole(effectiveRole, config);

  useEffect(() => { if(user) loadPayments(); }, [user]);
  const loadPayments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from('subscription_payments').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
      if (data) { setPayments(data); const v=data.find(p=>p.status==='verified'&&p.plan_id!=='trial'); if(v) setActivePlan(v.plan_id); }
    } catch {
      const local=JSON.parse(localStorage.getItem('rythu_payments')||'[]');
      setPayments(local.filter(p=>p.user_id===user?.id));
    }
  }, [user]);

  const handleSubscribe = (p) => { if(p.price===0) return; setSelectedPlan(p); setShowModal(true); };
  const handlePaymentSubmit = async (txnId) => {
    const userName = farmerProfile?.fullName || farmerProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const payment = { user_id:user?.id||'anon', user_name:userName, user_role:effectiveRole, user_email:user?.email||'', plan_id:selectedPlan.id, plan_name:selectedPlan.name, amount:selectedPlan.price, txn_id:txnId, payment_method:'upi', status:'pending', created_at:new Date().toISOString() };
    const localPayments = JSON.parse(localStorage.getItem('rythu_payments')||'[]');
    localPayments.unshift({...payment, id:'l-'+Date.now()});
    localStorage.setItem('rythu_payments', JSON.stringify(localPayments));
    try {
      let { data, error } = await supabase.from('subscription_payments').insert(payment).select();
      // If insert fails (e.g. user_role column doesn't exist), retry without it
      if (error) {
        console.warn('Payment insert error, retrying without user_role:', error.message);
        const { user_role, ...paymentWithoutRole } = payment;
        const result = await supabase.from('subscription_payments').insert(paymentWithoutRole).select();
        data = result.data;
        error = result.error;
      }
      if (!error && data && data[0]) setPayments(prev=>[data[0],...prev]);
      else setPayments(prev=>[{...payment,id:'l-'+Date.now()},...prev]);
    } catch (err) {
      console.warn('Payment insert failed:', err);
      setPayments(prev=>[{...payment,id:'l-'+Date.now()},...prev]);
    }
    setShowModal(false);
    setSuccessMsg(`✅ Payment submitted! TXN: ${txnId}. Admin will verify within 24 hours.`);
    setTimeout(()=>setSuccessMsg(''), 8000);
    // Reload payments to show updated list
    loadPayments();
  };

  const isTrial = !!localStorage.getItem(`rythu_coupon_${user?.id}`);
  const hasPending = payments.some(p => p.status === 'pending');
  const hasVerified = payments.some(p => p.status === 'verified');
  // Coupon users go straight through. Paid users need admin verification first.
  const canContinue = isTrial || hasVerified || activePlan !== 'basic';
  const isUnderVerification = hasPending && !isTrial && !hasVerified && activePlan === 'basic';

  const handleContinue = () => {
    // Set trial flag so App.jsx subscription guard lets user through
    if (user?.id) {
      if (!localStorage.getItem(`rythu_trial_${user.id}`)) {
        localStorage.setItem(`rythu_trial_${user.id}`, new Date().toISOString());
      }
      localStorage.setItem(`agri360_trial_${user.id}`, new Date().toISOString());
    }
    // Persist role so RoleDashboard/RoleRoute can read it even before Supabase loads
    if (effectiveRole) {
      localStorage.setItem('rythu_user_role', effectiveRole);
    }
    // Also persist payments flag for subscription guard
    if (payments.length > 0) {
      localStorage.setItem('agri360_payments', JSON.stringify(payments));
    }
    const dm = { customer:'/customer-dashboard', industrial:'/industrial-dashboard', broker:'/broker-dashboard', supplier:'/supplier-dashboard', labour:'/labour-dashboard', admin:'/admin' };
    navigate(dm[effectiveRole] || '/dashboard');
  };

  const shell = { minHeight:'100vh', background:'linear-gradient(135deg,#0a1628 0%,#0f2942 50%,#0a1628 100%)', display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px 80px' };
  const inner = { maxWidth:520, width:'100%' };
  const hdr = { display:'flex', alignItems:'center', gap:12, marginBottom:24 };
  const lgo = { width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', color:'#fff' };



  return (
    <div style={shell}><div style={inner}>
      <div style={hdr}><div style={lgo}>🌾</div><div style={{color:'#fff',fontWeight:800,fontSize:'1.2rem'}}>RythuSphere</div></div>
      <div style={{textAlign:'center',marginBottom:24}}>
        <div style={{fontSize:'2.5rem',marginBottom:8}}>🎁</div>
        <h2 style={{color:'#fff',fontSize:'1.4rem',fontWeight:800,margin:'0 0 6px',background:'linear-gradient(135deg,#10b981,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Choose Your Plan</h2>
        <p style={{color:'#94a3b8',fontSize:'0.82rem',margin:0}}>Unlock all premium features for your farming journey</p>
      </div>

      {successMsg && <div style={{background:'rgba(16,185,129,0.15)',borderRadius:12,padding:14,border:'1px solid rgba(16,185,129,0.3)',marginBottom:16,color:'#10b981',fontSize:'0.8rem',fontWeight:600}}>{successMsg}</div>}

      {/*  Plan Card First  */}
      <div style={{...S.card,border:`2px solid ${plan.color}50`,background:'linear-gradient(145deg,rgba(15,29,50,0.9),rgba(10,22,40,0.95))',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,background:`linear-gradient(135deg,${plan.color},${plan.color}aa)`,padding:'4px 16px',borderRadius:'0 0 0 12px',fontSize:'0.68rem',fontWeight:700,color:'#fff',textTransform:'uppercase'}}>Recommended</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,marginTop:8}}>
          <div>
            <div style={{color:'#e2e8f0',fontWeight:800,fontSize:'1.15rem'}}>{plan.name}</div>
            <div style={{color:'#64748b',fontSize:'0.75rem',marginTop:3}}>{effectiveRole==='farmer'?'👨‍🌾 Farmer':`👤 ${(effectiveRole||'').charAt(0).toUpperCase()+(effectiveRole||'').slice(1)}`}</div>
          </div>
          <div style={{textAlign:'right'}}><span style={{color:'#fff',fontWeight:900,fontSize:'2.2rem'}}>₹{plan.price}</span><div style={{color:'#64748b',fontSize:'0.75rem'}}>{plan.period}</div></div>
        </div>
        <div style={{marginBottom:18,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2px 0'}}>{plan.features.map((f,i)=><div key={i} style={{padding:'5px 0',display:'flex',alignItems:'center',gap:8,color:'#c8d6e5',fontSize:'0.78rem'}}><span style={{color:plan.color,fontSize:'0.75rem',fontWeight:700}}>✅</span>{f}</div>)}</div>
        {isTrial ? <div style={{...S.btn('rgba(16,185,129,0.15)'),color:'#10b981',textAlign:'center',fontSize:'0.9rem'}}>🟢 Free Trial Active</div>
         : activePlan===plan.id ? <div style={{...S.btn('rgba(16,185,129,0.15)'),color:'#10b981',textAlign:'center'}}>✅ Plan Active</div>
         : <button onClick={()=>handleSubscribe(plan)} style={{...S.btn(`linear-gradient(135deg,${plan.color},${plan.color}dd)`),fontSize:'0.9rem',letterSpacing:'0.3px'}}>💳 Subscribe —₹{plan.price} {plan.period}</button>}
      </div>

      {/*  Coupon Section Below Plan  */}
      <div style={{marginTop:20}}>
        <CouponSection user={user} config={config} onApplied={()=>{ forceUpdate(n=>n+1); loadPayments(); }} />
      </div>

      {/*  Trial Tracker —only shown after coupon applied  */}
      {isTrial && <div style={{marginTop:16}}><TrialTracker user={user} /></div>}


      {/*  Status —only when active  */}
      {(isTrial || activePlan!=='basic') && <div style={{background:'rgba(16,185,129,0.1)',borderRadius:12,padding:'10px 16px',border:'1px solid rgba(16,185,129,0.2)',marginTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:'#94a3b8',fontSize:'0.78rem'}}>Status:</span>
        <span style={{color:'#10b981',fontWeight:700,fontSize:'0.85rem'}}>{isTrial ? '🟢 Free Trial Active' : `⭐ ${plan.name} —Active`}</span>
      </div>}

      {/*  Under Verification Banner  */}
      {isUnderVerification && <div style={{marginTop:20,background:'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.05))',borderRadius:16,padding:'24px 20px',border:'1px solid rgba(245,158,11,0.3)',textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:12}}>⏳</div>
        <div style={{color:'#f59e0b',fontWeight:800,fontSize:'1.1rem',marginBottom:6}}>Payment Under Verification</div>
        <div style={{color:'#94a3b8',fontSize:'0.82rem',lineHeight:1.6,marginBottom:16}}>Your payment has been submitted and is awaiting admin approval. You'll get access to your dashboard once verified (usually within 24 hours).</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
          {payments.filter(p=>p.status==='pending').map((p,i)=>(
            <div key={i} style={{background:'rgba(245,158,11,0.1)',padding:'6px 14px',borderRadius:10,fontSize:'0.75rem',color:'#f59e0b',fontWeight:600}}>TXN: {p.txn_id}</div>
          ))}
        </div>
        <div style={{color:'#64748b',fontSize:'0.72rem',marginTop:12}}>📞 Contact support: 6303369360 | konankirajesh7@gmail.com</div>
      </div>}

      <MyPayments payments={payments} />

      {canContinue && <button onClick={handleContinue} style={{...S.btn('linear-gradient(135deg,#10b981,#059669)'),marginTop:24,fontSize:'1rem',padding:'16px',letterSpacing:'0.5px',boxShadow:'0 4px 20px rgba(16,185,129,0.3)'}}>✅ Continue to Dashboard →</button>}

      <div style={{marginTop:24,...S.card}}>
        <div style={{color:'#94a3b8',fontSize:'0.75rem',fontWeight:600,marginBottom:10}}>💳 How Payment Works</div>
        {['Apply coupon for 6 months free','When trial ends, pay via UPI','Enter Transaction ID after payment','Admin verifies —plan activates!'].map((s,i)=>(
          <div key={i} style={{display:'flex',gap:8,padding:'4px 0',fontSize:'0.72rem',color:'#64748b',alignItems:'flex-start'}}>
            <span style={{width:18,height:18,borderRadius:'50%',background:'rgba(16,185,129,0.15)',color:'#10b981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,flexShrink:0}}>{i+1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {showModal && selectedPlan && <PaymentModal plan={selectedPlan} config={config} onClose={()=>setShowModal(false)} onSubmit={handlePaymentSubmit} />}
    </div></div>
  );
}

