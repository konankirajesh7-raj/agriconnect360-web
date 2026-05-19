import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, farmersDB, cropsDB, labourDB } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';
import { useLanguage } from '../lib/i18n/LanguageContext';

const DEFAULT_TIPS = [
  { icon:'🌾', tip:'Apply DAP fertilizer 3 weeks after paddy transplanting for optimal tillering.', category:'Fertilizer', crop:'Paddy' },
  { icon:'🐛', tip:'Install yellow sticky traps in cotton fields to monitor whitefly.', category:'Pest Control', crop:'Cotton' },
  { icon:'💧', tip:'Drip irrigation saves 40% water vs flood. Ideal for sugarcane.', category:'Irrigation', crop:'Sugarcane' },
  { icon:'🧪', tip:'Soil pH 6.0-7.5 is ideal. Add lime if pH below 5.5.', category:'Soil Health', crop:'General' },
];

const QUICK_ACTIONS = [
  { icon:'🌤️', label:'Weather', path:'/weather', color:'#3b82f6' },
  { icon:'💰', label:'Market Prices', path:'/market-prices', color:'#f59e0b' },
  { icon:'🌱', label:'My Crops', path:'/crops', color:'#22c55e' },
  { icon:'🌾', label:'My Fields', path:'/fields', color:'#16a34a' },
  { icon:'🏪', label:'Suppliers', path:'/suppliers', color:'#ef4444' },
  { icon:'🚚', label:'Transport', path:'/transport', color:'#6366f1' },
  { icon:'👷', label:'Labour', path:'/labour', color:'#d97706' },
  { icon:'🤝', label:'Network', path:'/network', color:'#14b8a6' },
  { icon:'🤖', label:'AI Advisory', path:'/ai', color:'#8b5cf6' },
  { icon:'📋', label:'Equipment', path:'/equipment', color:'#0ea5e9' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { t: tl } = useLanguage();
  const { user, farmerProfile } = useAuth();
  const [tipIndex, setTipIndex] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({ fields:'-', crops:'-', notifications:'0' });
  const [dailyTips, setDailyTips] = useState(DEFAULT_TIPS);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * DEFAULT_TIPS.length));
    const h = new Date().getHours();
    setGreeting(h < 12 ? '🌅 Good Morning' : h < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening');
    // Try fetching tips from DB
    (async () => {
      try {
        const { data } = await supabase.from('agri_tips').select('*').limit(20);
        if (data?.length) setDailyTips(data.map(t => ({ icon: t.icon||'🌾', tip: t.tip||t.content||'', category: t.category||'General', crop: t.crop||'General' })));
      } catch {}
    })();
  }, []);

  // Fetch real stats + tasks from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    (async () => {
      try {
        const [fieldsRes, cropsRes, notifRes] = await Promise.allSettled([
          supabase.from('fields').select('id', { count:'exact', head:true }).eq('farmer_id', uid),
          supabase.from('crops').select('id', { count:'exact', head:true }).eq('farmer_id', uid),
          supabase.from('notifications').select('id', { count:'exact', head:true }).eq('farmer_id', uid).eq('is_read', false),
        ]);
        setStats({
          fields: fieldsRes.status==='fulfilled' && fieldsRes.value?.count != null ? String(fieldsRes.value.count) : '0',
          crops: cropsRes.status==='fulfilled' && cropsRes.value?.count != null ? String(cropsRes.value.count) : '0',
          notifications: notifRes.status==='fulfilled' && notifRes.value?.count != null ? String(notifRes.value.count) : '0',
        });
      } catch {}
      // Fetch tasks
      try {
        const { data } = await supabase.from('tasks').select('*').eq('user_id', uid).order('due_date', { ascending: true }).limit(10);
        if (data?.length) setTasks(data.map(t => ({ icon: t.icon||'📋', task: t.title||t.task||'', time: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN') : 'Upcoming', priority: t.priority||'medium', module: t.module||t.category||'Task' })));
      } catch {}
    })();
  }, [user?.id]);

  const userName = farmerProfile?.name || 'Farmer';
  const farmSummary = [
    { label:'Fields', value: stats.fields, icon:'🌾', color:'#22c55e', path:'/fields' },
    { label:'Active Crops', value: stats.crops, icon:'🌱', color:'#3b82f6', path:'/crops' },
    { label:'My Money', value:'💰', icon:'💰', color:'#fbbf24', path:'/my-money' },
    { label:'Notifications', value: stats.notifications, icon:'🔔', color:'#ef4444', path:'/notifications' },
  ];

  const tip = dailyTips[tipIndex % dailyTips.length] || DEFAULT_TIPS[0];
  const priorityColors = { high:'#ef4444', medium:'#f59e0b', low:'#22c55e' };

  return (
    <div style={{ maxWidth:'100%', willChange:'transform' }}>
      {/* Greeting */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text-primary)' }}>{greeting}, {userName}!</div>
        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      </div>

      {/* My Farm Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
        {farmSummary.map(s => (
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
          <span style={{ fontSize:'0.7rem', color:'#ef4444', fontWeight:700, background:'rgba(239,68,68,0.1)', padding:'3px 10px', borderRadius:8 }}>{tasks.filter(t=>t.priority==='high').length} urgent</span>
        </div>
        {tasks.length === 0 ? (
          <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)', fontSize:'0.82rem' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:6 }}>✅</div>
            No pending tasks. Add crops and fields to get smart task suggestions!
          </div>
        ) : tasks.map((t,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:10, background:'var(--bg-primary)', borderRadius:8, marginBottom:6, borderLeft:`3px solid ${priorityColors[t.priority]||'#f59e0b'}` }}>
            <span style={{ fontSize:'1.2rem' }}>{t.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>{t.task}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>{t.time} • {t.module}</div>
            </div>
            <span style={{ width:8, height:8, borderRadius:'50%', background:priorityColors[t.priority]||'#f59e0b' }} />
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
          <button onClick={() => setTipIndex((tipIndex+1)%dailyTips.length)} style={{ marginTop:8, padding:'5px 12px', fontSize:'0.72rem', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, color:'#fbbf24', cursor:'pointer' }}>🔄 Next</button>
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
