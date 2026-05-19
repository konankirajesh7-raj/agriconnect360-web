/**
 * Subscription & Pricing Management —RythuSphere
 * Admin-controlled pricing with role-based tiers
 * 
 * Pricing (per user answers):
 * - Customer: FREE forever (they buy goods, not a service user)
 * - Farmer: FREE for first 6 months → ₹100/year
 * - All other roles: ₹200/year
 * - Admin can modify all charges from this panel
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';
import { useLanguage } from '../lib/i18n/LanguageContext';

const DEFAULT_PLANS = {
  customer:   { price: 50, trial_days: 365, billing:'1 year',   label: 'Customer',  free_forever: false, desc: '₹50 per year —buy produce, suppliers & machinery' },
  farmer:     { price: 50, trial_days: 180, billing:'6 months', label: 'Farmer',     free_forever: false, desc: '6 months free, then ₹50 per 6 months' },
  supplier:   { price: 100,trial_days: 180, billing:'6 months', label: 'Supplier',   free_forever: false, desc: '6 months free trial, then ₹100 per 6 months' },
  broker:     { price: 100,trial_days: 180, billing:'6 months', label: 'Broker',     free_forever: false, desc: '6 months free trial, then ₹100 per 6 months' },
  labour:     { price: 100,trial_days: 180, billing:'6 months', label: 'Labour',     free_forever: false, desc: '6 months free trial, then ₹100 per 6 months' },
  industrial: { price: 100,trial_days: 180, billing:'6 months', label: 'Industrial', free_forever: false, desc: '6 months free trial, then ₹100 per 6 months' },
  admin:      { price: 0,  trial_days: 0,   billing:'forever',  label: 'Admin',      free_forever: true,  desc: 'Platform team —no charge' },
};


const ROLE_ICONS = {
  customer:'x:', farmer:'👨‍🌾', supplier:'👤', broker:'👤', labour:'x', industrial:'👤', admin:'a"️',
};

const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };

export default function SubscriptionPage() {
  const { t, tx } = useLanguage();
  const { farmerProfile, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [editMode, setEditMode] = useState(false);
  const [editPlans, setEditPlans] = useState(DEFAULT_PLANS);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [revenue, setRevenue] = useState({ total: 0, pending: 0, active: 0 });
  const [tab, setTab] = useState('plans');

  // Load plans from Supabase
  useEffect(() => {
    supabase.from('subscription_plans').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const loaded = { ...DEFAULT_PLANS };
        data.forEach(p => { if (loaded[p.role]) loaded[p.role] = { ...loaded[p.role], ...p }; });
        setPlans(loaded);
        setEditPlans(loaded);
      }
    }).catch(() => {});

    if (isAdmin) {
      // Try subscriptions table first (joined with profiles, not farmers)
      supabase.from('subscriptions').select('*, profiles(name, mobile, district, role)').order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => {
          if (data?.length) {
            setSubscribers(data.map(s => ({ ...s, user_name: s.profiles?.name, user_role: s.profiles?.role || s.role, user_district: s.profiles?.district })));
            const active = data.filter(s => s.status === 'active').length;
            const total = data.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
            const pending = data.filter(s => s.status === 'pending').reduce((sum, s) => sum + (s.amount_due || 0), 0);
            setRevenue({ total, pending, active });
          } else {
            // Fallback: use subscription_payments as subscriber tracker for ALL roles
            supabase.from('subscription_payments').select('*').order('created_at', { ascending: false }).limit(200)
              .then(({ data: payments }) => {
                if (payments?.length) {
                  const mapped = payments.map(p => ({
                    id: p.id, user_id: p.user_id, role: p.role || 'farmer',
                    user_name: p.user_name || p.user_id?.slice(0, 8),
                    user_role: p.role || 'farmer', user_district: p.district || '—',
                    status: p.status === 'verified' ? 'active' : p.status,
                    amount_paid: p.status === 'verified' ? (p.amount || 0) : 0,
                    amount_due: p.status !== 'verified' ? (p.amount || 0) : 0,
                    created_at: p.created_at,
                  }));
                  setSubscribers(mapped);
                  const active = mapped.filter(s => s.status === 'active').length;
                  const total = mapped.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
                  const pending = mapped.filter(s => s.status !== 'active').reduce((sum, s) => sum + (s.amount_due || 0), 0);
                  setRevenue({ total, pending, active });
                }
              }).catch(() => {});
          }
        }).catch(() => {});
    }
  }, [isAdmin]);

  const savePlans = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(editPlans).map(([role, plan]) => ({
        role, price: plan.price, trial_days: plan.trial_days,
        free_forever: plan.free_forever, updated_at: new Date().toISOString(),
      }));
      await supabase.from('subscription_plans').upsert(rows, { onConflict: 'role' });
      setPlans(editPlans);
      setSavedMsg('✅ Plans saved successfully!');
      setEditMode(false);
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setSavedMsg('❌ Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Trial status for current user
  const myPlan = plans[userRole] || plans.farmer;
  const joinedDate = farmerProfile?.created_at ? new Date(farmerProfile.created_at) : new Date();
  const daysJoined = Math.floor((Date.now() - joinedDate) / 86400000);
  const trialDaysLeft = Math.max(0, myPlan.trial_days - daysJoined);
  const isInTrial = !myPlan.free_forever && daysJoined < myPlan.trial_days;
  const trialPct = myPlan.trial_days > 0 ? Math.min(100, (daysJoined / myPlan.trial_days) * 100) : 100;

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">x} Subscription & Pricing</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>
            {isAdmin ? 'Admin: Manage all role pricing' : `Your plan: ${myPlan.label} ⬢ ${myPlan.free_forever ? 'Free Forever' : isInTrial ? `Trial: ${trialDaysLeft} days left` : '₹' + myPlan.price + '/' + (myPlan.billing || '6 months')}`}
          </div>
        </div>
      </div>

      {/* My Plan Banner —for non-admin */}
      {!isAdmin && (
        <div style={{ background: myPlan.free_forever ? 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.06))' : isInTrial ? 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(251,191,36,0.06))' : 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.06))', border:`1px solid ${myPlan.free_forever ? 'rgba(34,197,94,0.25)' : isInTrial ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}`, borderRadius:16, padding:'22px 24px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:'1.2rem', marginBottom:4 }}>
                {ROLE_ICONS[userRole]} {myPlan.label} Plan
                {myPlan.free_forever && <span style={{ marginLeft:8, background:'rgba(34,197,94,0.15)', color:'#22c55e', padding:'2px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:700 }}>FREE FOREVER</span>}
                {isInTrial && <span style={{ marginLeft:8, background:'rgba(245,158,11,0.15)', color:'#f59e0b', padding:'2px 10px', borderRadius:999, fontSize:'0.72rem', fontWeight:700 }}>TRIAL</span>}
              </div>
              <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{myPlan.desc}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              {myPlan.free_forever ? (
                <div style={{ fontSize:'2rem', fontWeight:900, color:'#22c55e' }}>₹0</div>
              ) : (
                <div style={{ fontSize:'2rem', fontWeight:900, color:'#6366f1' }}>₹{myPlan.price}<span style={{ fontSize:'0.9rem', fontWeight:500 }}>/{myPlan.billing||'6 months'}</span></div>
              )}
            </div>
          </div>

          {/* Trial progress bar */}
          {isInTrial && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:6 }}>
                <span>Trial Usage —{daysJoined} days used</span>
                <span style={{ color:'#f59e0b', fontWeight:700 }}>{trialDaysLeft} days remaining</span>
              </div>
              <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${trialPct}%`, background:'linear-gradient(90deg,#22c55e,#f59e0b)', borderRadius:4, transition:'width 0.5s' }} />
              </div>
              <div style={{ marginTop:10, fontSize:'0.78rem', color:'var(--text-muted)' }}>
                After trial: ₹{myPlan.price}/year billed annually ⬢ Pay via UPI, Net Banking, or Card
              </div>
            </div>
          )}

          {!myPlan.free_forever && !isInTrial && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button style={{ padding:'10px 24px', borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>
                  💳 Renew —₹{myPlan.price}/year
                </button>
                <button onClick={() => window.open('https://wa.me/919999999999?text=Hi, I need help with my RythuSphere subscription', '_blank')}
                  style={{ padding:'10px 20px', borderRadius:10, background:'rgba(37,211,102,0.15)', color:'#25d366', border:'1px solid rgba(37,211,102,0.3)', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>
                  💳 Contact Support
                </button>
              </div>
              <div style={{ marginTop:10, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                UPI: rythusphere@paytm ⬢ NEFT: State Bank (contact admin for details)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Tabs */}
      {isAdmin && (
        <>
          <div style={{ display:'flex', gap:6, marginBottom:20 }}>
            {[['plans','📋 Pricing Plans'],['subscribers','x Subscribers'],['revenue','💳 Revenue']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding:'9px 18px', borderRadius:20, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, background: tab===id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-card)', color: tab===id ? '#fff' : 'var(--text-muted)', transition:'all 0.2s' }}>{label}</button>
            ))}
          </div>

          {/* Revenue Stats */}
          <div className="grid-4" style={{ marginBottom:20 }}>
            {[
              { l:'Total Revenue', v:`₹${revenue.total.toLocaleString()}`, i:'💳', c:'#22c55e' },
              { l:'Pending Dues', v:`₹${revenue.pending.toLocaleString()}`, i:'⏳', c:'#f59e0b' },
              { l:'Active Subscribers', v:revenue.active, i:'✅', c:'#3b82f6' },
              { l:'Total Users', v:subscribers.length, i:'x', c:'#8b5cf6' },
            ].map(s => (
              <div key={s.l} className="stat-card">
                <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{s.i}</div>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Plans Tab */}
      {(!isAdmin || tab === 'plans') && (
        <div>
          {isAdmin && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:700 }}>📋 Role Pricing Configuration</div>
              <div style={{ display:'flex', gap:8 }}>
                {savedMsg && <span style={{ fontSize:'0.82rem', color: savedMsg.startsWith('✅') ? '#22c55e' : '#f87171', fontWeight:600 }}>{savedMsg}</span>}
                {editMode ? (
                  <>
                    <button onClick={savePlans} disabled={saving} style={{ padding:'8px 18px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>{saving ? '⏳ Saving...' : '✅ Save Changes'}</button>
                    <button onClick={() => { setEditMode(false); setEditPlans(plans); }} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.82rem' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} style={{ padding:'8px 18px', borderRadius:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>S️ Edit Prices</button>
                )}
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
            {Object.entries(isAdmin && editMode ? editPlans : plans).map(([role, plan]) => (
              <div key={role} className="card" style={{ padding:20, border: role === userRole ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'1rem' }}>{ROLE_ICONS[role]} {plan.label}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{plan.desc}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {plan.free_forever ? (
                      <span style={{ background:'rgba(34,197,94,0.12)', color:'#22c55e', padding:'4px 12px', borderRadius:999, fontSize:'0.75rem', fontWeight:800 }}>FREE</span>
                    ) : (
                      <div style={{ fontWeight:900, fontSize:'1.3rem', color:'var(--accent)' }}>₹{plan.price}<span style={{ fontSize:'0.7rem', fontWeight:500 }}>/{plan.billing||'6 months'}</span></div>
                    )}
                  </div>
                </div>

                {editMode && isAdmin && !plan.free_forever && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:3, fontWeight:700 }}>YEARLY PRICE (₹)</div>
                      <input type="number" value={editPlans[role].price} onChange={e => setEditPlans(p => ({ ...p, [role]: { ...p[role], price: +e.target.value } }))} style={{ ...INP, padding:'6px 10px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:3, fontWeight:700 }}>TRIAL DAYS</div>
                      <input type="number" value={editPlans[role].trial_days} onChange={e => setEditPlans(p => ({ ...p, [role]: { ...p[role], trial_days: +e.target.value } }))} style={{ ...INP, padding:'6px 10px' }} />
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {plan.free_forever ? (
                    <span style={{ fontSize:'0.72rem', color:'#22c55e' }}>✅ All features included</span>
                  ) : (
                    <>
                      {plan.trial_days > 0 && <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(245,158,11,0.1)', color:'#f59e0b', fontSize:'0.68rem', fontWeight:600 }}>⏱ {plan.trial_days}-day trial</span>}
                      <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(99,102,241,0.1)', color:'#818cf8', fontSize:'0.68rem', fontWeight:600 }}>x& Annual billing</span>
                      <span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(34,197,94,0.1)', color:'#22c55e', fontSize:'0.68rem', fontWeight:600 }}>💳 UPI / Card</span>
                    </>
                  )}
                </div>

                {role === userRole && (
                  <div style={{ marginTop:10, padding:'4px 10px', background:'rgba(var(--accent-rgb),0.1)', borderRadius:6, fontSize:'0.7rem', color:'var(--accent)', fontWeight:700, textAlign:'center' }}>
                    ⬅ Your Current Plan
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="card" style={{ padding:16, marginTop:16, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontWeight:700, fontSize:'0.85rem', marginBottom:6 }}>️ Pricing Policy —Andhra Pradesh Focus</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
              ⬢ <strong>Customers</strong> —₹50/year —buy produce, access suppliers & machinery<br/>
              ⬢ <strong>Farmers</strong> get 6 months free to build trust, then only ₹50/6 months<br/>
              ⬢ <strong>Other roles</strong> (Supplier, Broker, Labour, Industrial) —₹100/6 months<br/>
              ⬢ All charges modifiable by Admin from this panel<br/>
              ⬢ Currently serving <strong>Andhra Pradesh only</strong> —expanding state-wise on demand
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Tab (Admin only) */}
      {isAdmin && tab === 'subscribers' && (
        <div className="card">
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700 }}>
            x All Subscribers ({subscribers.length})
          </div>
          {subscribers.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'var(--text-muted)' }}>No subscribers yet —data loads from Supabase</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Role</th><th>District</th><th>Status</th><th>Joined</th><th>Paid</th><th>Due</th></tr></thead>
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight:600 }}>{s.user_name || s.user_id?.slice(0,8) || '—'}</td>
                      <td><span style={{ padding:'2px 8px', borderRadius:6, background:'rgba(99,102,241,0.1)', color:'#818cf8', fontSize:'0.72rem' }}>{s.user_role || s.role || '—'}</span></td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.user_district || '—'}</td>
                      <td><span style={{ padding:'2px 8px', borderRadius:6, fontSize:'0.72rem', fontWeight:700, background: s.status==='active' ? 'rgba(34,197,94,0.1)' : s.status==='trial' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: s.status==='active' ? '#22c55e' : s.status==='trial' ? '#f59e0b' : '#ef4444' }}>{s.status}</span></td>
                      <td style={{ fontSize:'0.78rem' }}>{s.created_at?.split('T')[0] || '—'}</td>
                      <td style={{ fontWeight:700, color:'#22c55e' }}>₹{(s.amount_paid||0).toLocaleString()}</td>
                      <td style={{ fontWeight:700, color: (s.amount_due||0) > 0 ? '#f59e0b' : 'var(--text-muted)' }}>₹{(s.amount_due||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab (Admin only) */}
      {isAdmin && tab === 'revenue' && (
        <div className="card" style={{ padding:32, textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>💳</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:6 }}>Revenue Dashboard</div>
          <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24 }}>Connect payment gateway (Razorpay/PayU) to see live revenue analytics</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, maxWidth:500, margin:'0 auto' }}>
            <div style={{ padding:16, borderRadius:12, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#22c55e' }}>₹{revenue.total.toLocaleString()}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Collected</div>
            </div>
            <div style={{ padding:16, borderRadius:12, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f59e0b' }}>₹{revenue.pending.toLocaleString()}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Pending</div>
            </div>
            <div style={{ padding:16, borderRadius:12, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#818cf8' }}>{revenue.active}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
