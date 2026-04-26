import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MANDIS_BY_CROP = {
  Cotton:  [{ name:'Guntur APMC', price:7150, district:'Guntur', arr:890 },{ name:'Kurnool APMC', price:6900, district:'Kurnool', arr:540 },{ name:'Vijayawada Mandi', price:7050, district:'Krishna', arr:620 },{ name:'Ongole APMC', price:6800, district:'Prakasam', arr:410 }],
  Paddy:   [{ name:'Guntur APMC', price:2180, district:'Guntur', arr:4520 },{ name:'Eluru APMC', price:2160, district:'Eluru', arr:3100 },{ name:'Tenali APMC', price:2200, district:'Guntur', arr:2900 },{ name:'Nellore APMC', price:2140, district:'Nellore', arr:2200 }],
  Chilli:  [{ name:'Guntur APMC', price:8400, district:'Guntur', arr:1200 },{ name:'Khammam APMC', price:8100, district:'Khammam', arr:800 },{ name:'Warangal Mandi', price:7950, district:'Warangal', arr:650 },{ name:'Sangareddy', price:8250, district:'Medak', arr:480 }],
  Groundnut:[{ name:'Kurnool APMC', price:5200, district:'Kurnool', arr:780 },{ name:'Anantapur APMC', price:5100, district:'Anantapur', arr:640 },{ name:'Nandyal APMC', price:5250, district:'Kurnool', arr:520 },{ name:'Tirupati APMC', price:5000, district:'Chittoor', arr:410 }],
};

const MOCK_PRICES = [
  { id: '1', crop_type: 'Paddy', market_name: 'Mysuru APMC', price_per_quintal: 2180, min_price: 2050, max_price: 2300, district: 'Mysuru', date: new Date().toISOString(), arrivals_quintals: 4520, source: 'enam', market_type: 'apmc' },
  { id: '2', crop_type: 'Sugarcane', market_name: 'Belagavi Sugar Factory', price_per_quintal: 3450, min_price: 3200, max_price: 3600, district: 'Belagavi', date: new Date().toISOString(), arrivals_quintals: 12000, source: 'direct', market_type: 'factory' },
  { id: '3', crop_type: 'Cotton', market_name: 'Dharwad APMC', price_per_quintal: 6800, min_price: 6500, max_price: 7100, district: 'Dharwad', date: new Date().toISOString(), arrivals_quintals: 890, source: 'enam', market_type: 'apmc' },
  { id: '4', crop_type: 'Wheat', market_name: 'Vijayapura Mandi', price_per_quintal: 2150, min_price: 2100, max_price: 2250, district: 'Vijayapura', date: new Date().toISOString(), arrivals_quintals: 6300, source: 'enam', market_type: 'apmc' },
  { id: '5', crop_type: 'Maize', market_name: 'Haveri APMC', price_per_quintal: 1980, min_price: 1850, max_price: 2100, district: 'Haveri', date: new Date().toISOString(), arrivals_quintals: 2100, source: 'enam', market_type: 'apmc' },
  { id: '6', crop_type: 'Tomato', market_name: 'Kolar Wholesale', price_per_quintal: 1200, min_price: 900, max_price: 1500, district: 'Kolar', date: new Date().toISOString(), arrivals_quintals: 3400, source: 'direct', market_type: 'broker' },
  { id: '7', crop_type: 'Groundnut', market_name: 'Tumkur APMC', price_per_quintal: 5200, min_price: 5000, max_price: 5500, district: 'Tumkur', date: new Date().toISOString(), arrivals_quintals: 780, source: 'enam', market_type: 'apmc' },
];

const HISTORY_DATA = [
  { day: '15M', price: 2050 }, { day: '12M', price: 2120 }, { day: '9M', price: 2200 },
  { day: '6M', price: 2080 }, { day: '3M', price: 2250 }, { day: '1M', price: 2180 }, { day: 'Now', price: 2190 },
];

// Pan-India price comparison data (Ninjacart inspired)
const PAN_INDIA_PRICES = [
  { state: 'Andhra Pradesh', price: 7150, trend: 'up', change: '+2.8%' },
  { state: 'Maharashtra', price: 7100, trend: 'up', change: '+1.8%' },
  { state: 'Gujarat', price: 7350, trend: 'up', change: '+3.1%' },
  { state: 'Telangana', price: 6600, trend: 'down', change: '-0.5%' },
  { state: 'Karnataka', price: 6800, trend: 'up', change: '+2.4%' },
  { state: 'Madhya Pradesh', price: 6950, trend: 'up', change: '+1.2%' },
  { state: 'Rajasthan', price: 7200, trend: 'up', change: '+2.0%' },
  { state: 'Punjab', price: 6500, trend: 'down', change: '-1.1%' },
];

// Best Mandi recommendation
const BEST_MANDIS = [
  { name: 'Rajkot APMC', state: 'Gujarat', price: 7350, distance: '680 km', premium: '+8.1%', rating: 4.6 },
  { name: 'Jalgaon APMC', state: 'Maharashtra', price: 7100, distance: '420 km', premium: '+4.4%', rating: 4.3 },
  { name: 'Indore Mandi', state: 'MP', price: 6950, distance: '560 km', premium: '+2.2%', rating: 4.5 },
];

export default function MarketPricesPage() {
  const { data: prices, loading, isLive } = useSupabaseQuery('market_prices', { orderBy: { column: 'date', ascending: false }, limit: 200, realtime: true }, MOCK_PRICES);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('prices');
  const [alerts, setAlerts] = useState([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ crop:'Cotton', type:'above', threshold:'' });
  const [compareCrop, setCompareCrop] = useState('Cotton');

  const avgPrice = prices.length ? Math.round(prices.reduce((s, p) => s + p.price_per_quintal, 0) / prices.length) : 0;

  const saveAlert = () => {
    if (!alertForm.threshold) return;
    setAlerts(prev => [...prev, { id:Date.now(), ...alertForm, createdAt:new Date().toLocaleDateString('en-IN') }]);
    setAlertForm({ crop:'Cotton', type:'above', threshold:'' });
    setShowAlertForm(false);
  };

  const tabs = [
    { id: 'prices',   icon: '📊', label: 'Market Rates' },
    { id: 'alerts',   icon: '🔔', label: 'Price Alerts' },
    { id: 'compare',  icon: '⚖️', label: 'Compare Markets' },
    { id: 'heatmap',  icon: '🗺️', label: 'Pan-India Prices' },
    { id: 'best-mandi',icon: '🏆', label: 'Best Mandi' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">💰 Market Prices & Intelligence</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>e-NAM integrated APMC rates • LSTM forecasts • Pan-India comparison</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={()=>{setShowAlertForm(true); setActiveTab('alerts');}}>🔔 Set Price Alert</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Crops Tracked', value: prices.length, icon: '🌾', color: '#22c55e' },
          { label: 'Avg Price/Quintal', value: `₹${avgPrice.toLocaleString()}`, icon: '💰', color: '#f59e0b' },
          { label: 'Markets Active', value: new Set(prices.map(p => p.market_name)).size, icon: '🏪', color: '#3b82f6' },
          { label: 'Districts Covered', value: new Set(prices.map(p => p.district)).size, icon: '📍', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600,
              background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
            }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {activeTab === 'prices' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="card">
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, padding: '0 4px' }}>📊 Today's Market Rates</div>
            {loading ? <div className="loading-state">⟳ Loading prices...</div> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Crop</th><th>Market</th><th>District</th><th>Min</th><th>Price</th><th>Max</th><th>Arrivals (Q)</th><th>Source</th></tr></thead>
                  <tbody>
                    {prices.map(p => (
                      <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontWeight: 600 }}>{p.crop_type}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.market_name}</td>
                        <td>{p.district}</td>
                        <td style={{ color: '#ef4444' }}>₹{p.min_price}</td>
                        <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{p.price_per_quintal}</td>
                        <td style={{ color: '#3b82f6' }}>₹{p.max_price}</td>
                        <td>{p.arrivals_quintals?.toLocaleString()}</td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.source}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
              📈 {selected ? `${selected.crop_type} Price Trend` : 'Select a crop for trend'}
            </div>
            {selected ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>₹{selected.price_per_quintal}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per quintal · {selected.market_name}</div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={HISTORY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12, padding: '10px', background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>🤖 AI Forecast</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>LSTM predicts ₹{selected.price_per_quintal + 120} by next week. Hold stock if possible.</div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem' }}>👆 Click any crop row to view price trend</div>
            )}
          </div>
        </div>
      )}

      {/* Price Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {/* Set Alert Form */}
          {showAlertForm && (
            <div className="card" style={{ padding:20, marginBottom:16, border:'1px solid rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.04)' }}>
              <div style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:16 }}>🔔 Set Price Alert</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'flex-end' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>Crop</label>
                  <select value={alertForm.crop} onChange={e=>setAlertForm(p=>({...p,crop:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem' }}>
                    {['Cotton','Paddy','Chilli','Sugarcane','Groundnut','Maize'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>Alert Type</label>
                  <select value={alertForm.type} onChange={e=>setAlertForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem' }}>
                    <option value="above">When price goes ABOVE</option>
                    <option value="below">When price goes BELOW</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>Threshold (₹/quintal)</label>
                  <input type="number" placeholder="e.g. 6500" value={alertForm.threshold} onChange={e=>setAlertForm(p=>({...p,threshold:e.target.value}))} style={{ width:'100%', padding:'9px 12px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' }}/>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary" onClick={saveAlert} disabled={!alertForm.threshold}>Save Alert</button>
                  <button className="btn btn-outline" onClick={()=>setShowAlertForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {!showAlertForm && (
            <button className="btn btn-primary" style={{ marginBottom:16 }} onClick={()=>setShowAlertForm(true)}>+ Set New Alert</button>
          )}

          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:16 }}>My Alerts</div>
            {alerts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:'0.85rem' }}>🔔 No alerts set. Click "Set New Alert" to create one.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {alerts.map(a=>(
                  <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'rgba(245,158,11,0.06)', borderRadius:8, border:'1px solid rgba(245,158,11,0.2)' }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{a.crop} — {a.type==='above'?'↑ Above':'↓ Below'} ₹{parseFloat(a.threshold).toLocaleString()}/quintal</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>Set on {a.createdAt}</div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span className="badge badge-warning">Active</span>
                      <button onClick={()=>setAlerts(p=>p.filter(x=>x.id!==a.id))} style={{ background:'rgba(239,68,68,0.12)', border:'none', borderRadius:6, padding:'4px 10px', cursor:'pointer', color:'#ef4444', fontSize:'0.78rem' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compare Markets Tab */}
      {activeTab === 'compare' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600 }}>Select Crop:</div>
            {Object.keys(MANDIS_BY_CROP).map(c=>(
              <button key={c} onClick={()=>setCompareCrop(c)}
                style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
                  background:compareCrop===c?'#22c55e':'var(--bg-card)', color:compareCrop===c?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
                {c}
              </button>
            ))}
          </div>

          {(() => {
            const mandis = MANDIS_BY_CROP[compareCrop] || [];
            const best = Math.max(...mandis.map(m=>m.price));
            return (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
                  {mandis.map((m,i)=>(
                    <div key={m.name} className="card" style={{ padding:18, border:m.price===best?'2px solid #22c55e':undefined, position:'relative' }}>
                      {m.price===best && <span style={{ position:'absolute', top:8, right:8, background:'#22c55e', color:'#fff', padding:'2px 8px', borderRadius:10, fontSize:'0.6rem', fontWeight:700 }}>BEST</span>}
                      <div style={{ fontSize:'0.82rem', fontWeight:700, marginBottom:2 }}>{m.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:10 }}>{m.district}</div>
                      <div style={{ fontSize:'1.5rem', fontWeight:800, color:m.price===best?'#22c55e':'var(--text-primary)' }}>₹{m.price.toLocaleString()}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>Arrivals: {m.arr.toLocaleString()} Q</div>
                      <div style={{ marginTop:8, fontSize:'0.72rem', color:m.price===best?'#22c55e':'#ef4444', fontWeight:600 }}>
                        {m.price===best?'👑 Highest today':`₹${best-m.price} less than best`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding:'20px 24px' }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:16 }}>⚖️ Side-by-Side Price Comparison — {compareCrop}</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mandis} margin={{ top:10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }}/>
                      <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} tickFormatter={v=>`₹${v.toLocaleString()}`} domain={['auto','auto']}/>
                      <Tooltip formatter={v=>[`₹${v.toLocaleString()}/Q`,'']} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                      <Bar dataKey="price" name="Price" radius={[4,4,0,0]}
                        fill="#22c55e"
                        label={{ position:'top', fill:'#22c55e', fontSize:11, formatter:v=>`₹${v.toLocaleString()}` }}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>🗺️ Pan-India Price Comparison</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cotton prices across major states (₹/quintal)</div>
            </div>
            <select style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
              <option>Cotton</option><option>Paddy</option><option>Wheat</option><option>Soybean</option><option>Maize</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {PAN_INDIA_PRICES.map((s, i) => {
              const maxP = Math.max(...PAN_INDIA_PRICES.map(x => x.price));
              const intensity = (s.price / maxP);
              return (
                <div key={s.state} style={{
                  padding: '16px', borderRadius: 'var(--radius-sm)', position: 'relative', cursor: 'pointer',
                  background: `linear-gradient(135deg, rgba(34,197,94,${intensity * 0.15}), rgba(34,197,94,${intensity * 0.05}))`,
                  border: `1px solid rgba(34,197,94,${intensity * 0.3})`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.state}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e' }}>₹{s.price.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: s.trend === 'up' ? '#22c55e' : '#ef4444', fontWeight: 600, marginTop: 4 }}>
                    {s.trend === 'up' ? '↑' : '↓'} {s.change}
                  </div>
                  {i === 0 && <span style={{ position: 'absolute', top: 8, right: 8, background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700 }}>YOUR STATE</span>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>💡 AI Insight</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
              Gujarat offers <strong>₹550 more</strong> per quintal (+8.1%) than your local Dharwad APMC. Consider transport cost of ~₹200/quintal — net benefit ₹350/quintal.
              For 50 quintals, potential extra earnings: <strong style={{ color: '#22c55e' }}>₹17,500</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'best-mandi' && (
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: 16, background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>🏆 Best Mandi For Your Crop</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Where to sell your Cotton for the highest price — including transport cost analysis</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {BEST_MANDIS.map((m, i) => (
              <div key={m.name} className="card" style={{ padding: '20px', border: i === 0 ? '2px solid #22c55e' : undefined }}>
                {i === 0 && <span className="badge badge-green" style={{ marginBottom: 10, display: 'inline-block' }}>🏆 Best Price</span>}
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{m.state} • {m.distance}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e', marginBottom: 8 }}>₹{m.price.toLocaleString()}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/qtl</span></div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span className="badge badge-green">{m.premium} vs local</span>
                  <span className="badge badge-blue">⭐ {m.rating}</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>View Details & Route</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
