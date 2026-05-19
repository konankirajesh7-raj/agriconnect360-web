import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const REWARDS = [
  { id:1, name:'Convert to ₹100', cost:100, icon:'💸', desc:'Convert 100 coins to ₹100 in your bank account' },
  { id:2, name:'Convert to ₹500', cost:500, icon:'💰', desc:'Convert 500 coins to ₹500 in your bank account' },
  { id:3, name:'Pro Plan 1 Month', cost:500, icon:'💎', desc:'Unlock AI Advisory + Priority Support + All Premium features' },
  { id:4, name:'Pro Plan 3 Months', cost:1200, icon:'👑', desc:'3 months premium access at discounted rate (save 300 coins)' },
  { id:5, name:'₹200 Equipment Rent Off', cost:200, icon:'🚜', desc:'₹200 discount on any equipment rental booking' },
  { id:6, name:'Free Soil Test', cost:300, icon:'🧪', desc:'Redeem for 1 free soil testing at any partnered lab' },
];

const EARN_WAYS = [
  { action:'Refer a new farmer (verified signup)', coins:'+50 🪙', icon:'👨‍🌾', difficulty:'🟡 Medium', desc:'Referred farmer must complete profile and use the app for 7 days' },
  { action:'Post a farming video on Knowledge hub', coins:'+30 🪙', icon:'🎬', difficulty:'🟡 Medium', desc:'Video must be original, 30sec+, and approved by moderators (24-48hr review)' },
];

export default function WalletPage() {
  const { t, tx } = useLanguage();
  const { uid } = useAuth();
  const { data: dbRewards } = useSupabaseQuery('wallet_rewards', { select:'*', orderBy:{ column:'cost', ascending:true }, limit:20 }, REWARDS);
  const rewards = (dbRewards || REWARDS).map(r => ({ ...r, icon: r.icon || '🎁', desc: r.desc || r.description || '' }));
  const [tab, setTab] = useState('overview');
  const [coinHistory, setCoinHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemModal, setRedeemModal] = useState(null);
  const [referralCode] = useState('AGRI-' + Math.random().toString(36).substring(2,6).toUpperCase());

  // Fetch wallet transactions from Supabase
  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(100);
        if (data?.length) {
          const history = data.map((t, i) => ({
            id: t.id || i,
            type: t.amount >= 0 ? 'earn' : 'spend',
            amount: t.amount || 0,
            desc: t.description || t.title || 'Transaction',
            date: t.created_at?.split('T')[0] || '',
            icon: t.amount >= 0 ? (t.description?.includes('Refer') ? '👨‍🌾' : '🎬') : (t.description?.includes('Pro') ? '💎' : '💸'),
          }));
          setCoinHistory(history);
          const earned = history.filter(h => h.amount > 0).reduce((s, h) => s + h.amount, 0);
          const spent = Math.abs(history.filter(h => h.amount < 0).reduce((s, h) => s + h.amount, 0));
          setTotalEarned(earned);
          setBalance(earned - spent);
        }
      } catch {}
      setLoading(false);
    })();
  }, [uid]);

  const tabs = [
    { id:'overview', label:'🪙 My Coins' },
    { id:'earn', label:'💰 How to Earn' },
    { id:'rewards', label:'🎁 Spend Coins' },
    { id:'history', label:'📋 History' },
  ];

  const HistoryItem = ({ h }) => (
    <div className="card" style={{ padding:'10px 14px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <span style={{ fontSize:'1.3rem' }}>{h.icon}</span>
        <div>
          <div style={{ fontWeight:600, fontSize:'0.82rem' }}>{h.desc}</div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{h.date ? new Date(h.date).toLocaleDateString('en-IN') : '—'}</div>
        </div>
      </div>
      <span style={{ fontWeight:800, fontSize:'0.9rem', color: h.amount > 0 ? '#34d399' : '#f87171' }}>{h.amount > 0 ? '+' : ''}{h.amount} 🪙</span>
    </div>
  );

  const EmptyHistory = () => (
    <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>🪙</div>
      <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:4 }}>No transactions yet</div>
      <div style={{ fontSize:'0.8rem' }}>Earn coins by referring farmers or posting knowledge videos!</div>
    </div>
  );

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🪙 Kisan Wallet</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>Earn by referrals & knowledge videos • Spend on Pro plan & cash</div>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ background:'linear-gradient(135deg, #065f46, #0369a1)', borderRadius:14, padding:'24px 20px', marginBottom:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
        <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.7)' }}>Available Balance</div>
        <div style={{ fontSize:'2.8rem', fontWeight:900, color:'#fbbf24', marginTop:4 }}>🪙 {loading ? '...' : balance}</div>
        <div style={{ display:'flex', gap:20, marginTop:12 }}>
          <div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)' }}>Total Earned</div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:'#34d399' }}>+{totalEarned} 🪙</div>
          </div>
          <div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.6)' }}>Spent</div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:'#f87171' }}>-{totalEarned - balance} 🪙</div>
          </div>
        </div>
        <div style={{ marginTop:10, padding:'6px 14px', background:'rgba(255,255,255,0.1)', borderRadius:8, display:'inline-block', fontSize:'0.75rem', color:'rgba(255,255,255,0.8)' }}>
          💡 Coins are hard to earn — only by referrals & knowledge videos
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--bg-primary)', borderRadius:10, padding:4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', fontSize:'0.75rem', fontWeight:tab === t.id ? 700 : 500, cursor:'pointer', background: tab === t.id ? 'var(--bg-card)' : 'transparent', color: tab === t.id ? '#fbbf24' : 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>🔥 What You Can Do</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            <div className="card" style={{ padding:14, textAlign:'center', cursor:'pointer' }} onClick={() => setTab('earn')}>
              <div style={{ fontSize:'1.8rem', marginBottom:6 }}>👨‍🌾</div>
              <div style={{ fontWeight:700, fontSize:'0.82rem' }}>Refer & Earn</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>+50 per referral</div>
            </div>
            <div className="card" style={{ padding:14, textAlign:'center', cursor:'pointer' }} onClick={() => setTab('rewards')}>
              <div style={{ fontSize:'1.8rem', marginBottom:6 }}>💸</div>
              <div style={{ fontWeight:700, fontSize:'0.82rem' }}>Convert to Cash</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>100 coins = ₹100</div>
            </div>
            <div className="card" style={{ padding:14, textAlign:'center', cursor:'pointer' }} onClick={() => setTab('rewards')}>
              <div style={{ fontSize:'1.8rem', marginBottom:6 }}>💎</div>
              <div style={{ fontWeight:700, fontSize:'0.82rem' }}>Buy Pro Plan</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>500 coins</div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="card" style={{ padding:16, marginBottom:16, background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(139,92,246,0.06))', border:'1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight:700, fontSize:'0.88rem', marginBottom:6 }}>🎟️ Your Referral Code</div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ flex:1, padding:'10px 14px', background:'var(--bg-primary)', borderRadius:8, fontWeight:800, fontSize:'1.1rem', color:'#fbbf24', letterSpacing:2, textAlign:'center' }}>{referralCode}</div>
              <button onClick={() => { navigator.clipboard?.writeText(referralCode); }} style={{ padding:'10px 14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>📋 Copy</button>
              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join RythuSphere! Use my code ${referralCode}. Earn 50 coins each!`)}`)} style={{ padding:'10px 14px', borderRadius:8, border:'none', background:'#25D366', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>💬 Share</button>
            </div>
          </div>

          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>📋 Recent Activity</div>
          {coinHistory.length === 0 ? <EmptyHistory /> : coinHistory.slice(0, 5).map(h => <HistoryItem key={h.id} h={h} />)}
        </div>
      )}

      {/* EARN — only 2 ways */}
      {tab === 'earn' && (
        <div>
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#fbbf24', marginBottom:4 }}>⚠️ Coins are Exclusive</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.6 }}>
              Kisan Coins are not easy to earn. There are only <strong style={{ color:'#fbbf24' }}>2 ways</strong> to get them — by referring new farmers to the platform, or by posting original farming knowledge videos. This makes coins truly valuable.
            </div>
          </div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>💰 Ways to Earn Kisan Coins</div>
          {EARN_WAYS.map((e, i) => (
            <div key={i} className="card" style={{ padding:18, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:'2rem' }}>{e.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{e.action}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{e.desc}</div>
                  </div>
                </div>
                <span style={{ fontWeight:900, fontSize:'1rem', color:'#fbbf24', whiteSpace:'nowrap' }}>{e.coins}</span>
              </div>
              <div style={{ display:'flex', gap:8, fontSize:'0.72rem' }}>
                <span style={{ padding:'3px 10px', borderRadius:8, background:'rgba(245,158,11,0.1)', color:'#f59e0b', fontWeight:600 }}>{e.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REWARDS / SPEND */}
      {tab === 'rewards' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>🎁 Spend Your Coins</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {REWARDS.map(r => (
              <div key={r.id} className="card" style={{ padding:16 }}>
                <div style={{ textAlign:'center', fontSize:'2.5rem', marginBottom:8 }}>{r.icon}</div>
                <div style={{ fontWeight:700, fontSize:'0.9rem', textAlign:'center' }}>{r.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', marginTop:4 }}>{r.desc}</div>
                <div style={{ textAlign:'center', marginTop:8 }}>
                  <span style={{ fontWeight:800, fontSize:'1rem', color:'#fbbf24' }}>{r.cost} 🪙</span>
                </div>
                <button onClick={() => setRedeemModal(r)} disabled={balance < r.cost}
                  style={{ width:'100%', marginTop:10, padding:'8px', borderRadius:8, border:'none', fontWeight:700, fontSize:'0.82rem', cursor: balance >= r.cost ? 'pointer' : 'not-allowed', background: balance >= r.cost ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.05)', color: balance >= r.cost ? '#fff' : 'var(--text-muted)' }}>
                  {balance >= r.cost ? '🎁 Redeem' : `🔒 Need ${r.cost - balance} more`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>📋 Full Transaction History</div>
          {coinHistory.length === 0 ? <EmptyHistory /> : coinHistory.map(h => <HistoryItem key={h.id} h={h} />)}
        </div>
      )}

      {/* Redeem Modal */}
      {redeemModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setRedeemModal(null)}>
          <div className="card" style={{ width:360, padding:24, textAlign:'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>{redeemModal.icon}</div>
            <div style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:6 }}>{redeemModal.name}</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:12 }}>{redeemModal.desc}</div>
            <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#fbbf24', marginBottom:16 }}>{redeemModal.cost} 🪙</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={async () => {
                try {
                  await supabase.from('wallet_transactions').insert({ user_id: uid, amount: -redeemModal.cost, description: 'Redeemed: ' + redeemModal.name });
                } catch {}
                setBalance(prev => prev - redeemModal.cost);
                setCoinHistory(prev => [{ id: Date.now(), type:'spend', amount: -redeemModal.cost, desc:'Redeemed: '+redeemModal.name, date: new Date().toISOString().split('T')[0], icon: redeemModal.icon }, ...prev]);
                setRedeemModal(null);
              }} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', fontWeight:700, cursor:'pointer' }}>✅ Confirm</button>
              <button onClick={() => setRedeemModal(null)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
