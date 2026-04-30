import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmersDB, cropsDB, labourDB } from '../lib/supabase';
import { useLanguage } from '../lib/i18n/LanguageContext';

const DAILY_TIPS = [
  { icon:'🌾', tip:'Apply DAP fertilizer 3 weeks after paddy transplanting for optimal tillering. Use 50kg/acre.', category:'Fertilizer', crop:'Paddy' },
  { icon:'🐛', tip:'Install yellow sticky traps in cotton fields to monitor whitefly. Place 5 traps per acre.', category:'Pest Control', crop:'Cotton' },
  { icon:'💧', tip:'Drip irrigation saves 40% water vs flood. Ideal for sugarcane — 2-hour sessions every 3 days.', category:'Irrigation', crop:'Sugarcane' },
  { icon:'📊', tip:'Cotton prices peak March-April. Hold 30% of stock if quality is Grade A+ for premium rates.', category:'Market', crop:'Cotton' },
  { icon:'🧪', tip:'Soil pH 6.0-7.5 is ideal. Add lime (2 tons/acre) if pH below 5.5 for better absorption.', category:'Soil Health', crop:'General' },
  { icon:'🥜', tip:'Groundnut requires well-drained sandy loam soil. Sow at 30cm spacing for maximum pod yield.', category:'Sowing', crop:'Groundnut' },
];

const UPCOMING_TASKS = [
  { icon:'💧', task:'Irrigate Cotton Field B2', time:'Today, 6:00 AM', priority:'high', module:'Crop Health' },
  { icon:'🧪', task:'Soil test results ready — Field A1', time:'Today, 10:00 AM', priority:'medium', module:'Soil & Water' },
  { icon:'🐛', task:'Spray neem oil on chilli crops', time:'Tomorrow', priority:'high', module:'Pest Control' },
  { icon:'📦', task:'Harvest paddy — Field C3', time:'In 3 days', priority:'medium', module:'Harvest' },
  { icon:'💰', task:'Collect payment from APMC sale', time:'In 5 days', priority:'low', module:'Finance' },
];

const QUICK_ACTIONS = [
  { icon:'🌤️', label:'Weather', path:'/weather', color:'#3b82f6' },
  { icon:'💰', label:'Market Prices', path:'/market-prices', color:'#f59e0b' },
  { icon:'🌱', label:'My Crops', path:'/crops', color:'#22c55e' },
  { icon:'🌾', label:'My Fields', path:'/fields', color:'#16a34a' },
  { icon:'🏪', label:'Suppliers', path:'/suppliers', color:'#ef4444' },
  { icon:'🚚', label:'Transport', path:'/transport', color:'#6366f1' },
  { icon:'👷', label:'Labour', path:'/labour', color:'#d97706' },
  { icon:'🪙', label:'Wallet', path:'/wallet', color:'#fbbf24' },
  { icon:'🤝', label:'Network', path:'/network', color:'#14b8a6' },
  { icon:'🤖', label:'AI Advisory', path:'/ai', color:'#8b5cf6' },
  { icon:'📋', label:'Equipment', path:'/equipment', color:'#0ea5e9' },
  { icon:'🧪', label:'Soil Test', path:'/soil', color:'#dc2626' },
];

const MY_FARM_SUMMARY = [
  { label:'Fields', value:'6', icon:'🌾', color:'#22c55e', path:'/fields' },
  { label:'Active Crops', value:'5', icon:'🌱', color:'#3b82f6', path:'/crops' },
  { label:'Kisan Coins', value:'155 🪙', icon:'💰', color:'#fbbf24', path:'/wallet' },
  { label:'Notifications', value:'3', icon:'🔔', color:'#ef4444', path:'/notifications' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t: tl } = useLanguage();
  const [tipIndex, setTipIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * DAILY_TIPS.length));
    const h = new Date().getHours();
    setGreeting(h < 12 ? '🌅 Good Morning' : h < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const fetchLive = async () => {
      try {
        const [f, c] = await Promise.all([farmersDB.count(), cropsDB.count()]);
        if (f.count !== null || c.count !== null) setIsLive(true);
      } catch {} finally { clearTimeout(timeout); }
    };
    fetchLive();
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  const tip = DAILY_TIPS[tipIndex];
  const priorityColors = { high:'#ef4444', medium:'#f59e0b', low:'#22c55e' };

  return (
    <div style={{ maxWidth:'100%', willChange:'transform' }}>
      {/* Greeting */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text-primary)' }}>{greeting}, Farmer!</div>
        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      </div>

      {/* My Farm Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
        {MY_FARM_SUMMARY.map(s => (
          <div key={s.label} onClick={() => navigate(s.path)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 10px', textAlign:'center', cursor:'pointer', borderBottom:`3px solid ${s.color}`, transition:'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform=''}>
            <div style={{ fontSize:'1.5rem', marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:'1.2rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:'0.88rem', fontWeight:700, marginBottom:10 }}>⚡ Quick Actions</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 6px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, cursor:'pointer', color:'var(--text-primary)', transition:'transform 0.15s', fontSize:'0.72rem', fontWeight:600 }}
              onTouchStart={e => e.currentTarget.style.transform='scale(0.96)'} onTouchEnd={e => e.currentTarget.style.transform='scale(1)'}>
              <span style={{ fontSize:'1.4rem', filter:`drop-shadow(0 0 4px ${a.color}40)` }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontSize:'0.88rem', fontWeight:700 }}>📋 Today's Tasks</span>
          <span style={{ fontSize:'0.7rem', color:'#ef4444', fontWeight:700, background:'rgba(239,68,68,0.1)', padding:'3px 10px', borderRadius:8 }}>{UPCOMING_TASKS.filter(t=>t.priority==='high').length} urgent</span>
        </div>
        {UPCOMING_TASKS.map((t,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:10, background:'var(--bg-primary)', borderRadius:8, marginBottom:6, borderLeft:`3px solid ${priorityColors[t.priority]}` }}>
            <span style={{ fontSize:'1.2rem' }}>{t.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>{t.task}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>{t.time} • {t.module}</div>
            </div>
            <span style={{ width:8, height:8, borderRadius:'50%', background:priorityColors[t.priority] }} />
          </div>
        ))}
      </div>

      {/* Tip + Weather Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Tip of the Day */}
        <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(34,197,94,0.06))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#f59e0b' }}>💡 Farming Tip</span>
            <div style={{ display:'flex', gap:4 }}>
              <span style={{ fontSize:'0.6rem', padding:'2px 6px', background:'rgba(59,130,246,0.15)', color:'#60a5fa', borderRadius:4 }}>{tip.crop}</span>
            </div>
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
            <span style={{ fontSize:'1.1rem', marginRight:4 }}>{tip.icon}</span>{tip.tip}
          </div>
          <button onClick={() => setTipIndex((tipIndex+1)%DAILY_TIPS.length)} style={{ marginTop:8, padding:'5px 12px', fontSize:'0.72rem', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, color:'#fbbf24', cursor:'pointer' }}>🔄 Next</button>
        </div>

        {/* Quick Weather */}
        <div onClick={() => navigate('/weather')} style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(6,182,212,0.08))', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, padding:16, cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
          <span style={{ fontSize:'2.5rem' }}>🌤️</span>
          <div style={{ fontSize:'0.88rem', fontWeight:700, marginTop:6 }}>Weather</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>Tap for full forecast →</div>
        </div>
      </div>
    </div>
  );
}
