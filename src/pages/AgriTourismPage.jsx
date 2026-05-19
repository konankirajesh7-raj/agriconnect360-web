import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';
import { useLanguage } from '../lib/i18n/LanguageContext';

const EXPERIENCES = [
  { id:1, title:'Organic Rice Farm Stay', farmer:'Ravi Kumar', village:'Mangalagiri, Guntur', price:1500, rating:4.8, reviews:45, duration:'1 Day', category:'Farm Stay', image:'🌾', highlights:['Organic paddy harvesting','Traditional cooking class','Bullock cart ride','Campfire dinner'], maxGuests:8, isMine:false },
  { id:2, title:'Cotton Farm Experience', farmer:'Suresh Reddy', village:'Adoni, Kurnool', price:800, rating:4.6, reviews:23, duration:'Half Day', category:'Tour', image:'🏵️', highlights:['Cotton picking demo','Ginning unit visit','Farmer lunch'], maxGuests:15, isMine:false },
  { id:3, title:'Mango Orchard Festival', farmer:'Venkat Rao', village:'Nunna, Krishna', price:600, rating:4.9, reviews:87, duration:'4 Hours', category:'Festival', image:'🥭', highlights:['Pick your own mangoes','Mango tasting (10 varieties)','Farm-fresh juice'], maxGuests:30, isMine:false },
  { id:4, title:'Spice Plantation Walk', farmer:'Anitha Bai', village:'Araku Valley', price:2000, rating:4.7, reviews:34, duration:'2 Days', category:'Farm Stay', image:'🌿', highlights:['Coffee plantation tour','Spice identification','Tribal village visit','Sunrise trek'], maxGuests:6, isMine:false },
  { id:5, title:'Dairy Farm Morning', farmer:'Krishna M.', village:'Tirupati, Chittoor', price:400, rating:4.5, reviews:19, duration:'3 Hours', category:'Tour', image:'🐄', highlights:['Milking demonstration','Butter & ghee making','Calf feeding'], maxGuests:12, isMine:false },
];

export default function AgriTourismPage() {
  const { t, tx } = useLanguage();
  const { user, farmerProfile } = useAuth();
  const [tab, setTab] = useState('browse');
  const [booked, setBooked] = useState([]);
  const [filter, setFilter] = useState('All');
  const [listings, setListings] = useState(EXPERIENCES);
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ title:'', price:'', duration:'Half Day', category:'Tour', highlights:'', maxGuests:'', desc:'' });
  const [myListings, setMyListings] = useState([]);

  // Load user's bookings from Supabase
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await supabase.from('agritourism_bookings').select('*').eq('user_id', user.id);
        if (data?.length) setBooked(data.map(d => d.listing_id));
      } catch {}
    })();
  }, [user?.id]);

  // Fetch from Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data: all } = await supabase.from('agritourism_listings').select('*').eq('status','active').order('created_at',{ascending:false}).limit(50);
        if (all?.length) {
          const mapped = all.map(a => ({ id:a.id, title:a.title, farmer:a.contact||'Farmer', village:a.location||a.district, price:a.price_per_person||0, rating:a.rating||0, reviews:a.reviews||0, duration:'Half Day', category:'Tour', image:'🌿', highlights:(a.activities||'').split(',').filter(Boolean), maxGuests:10, isMine:a.user_id===user?.id }));
          setListings([...mapped, ...EXPERIENCES]);
        }
        if (user?.id) {
          const { data: mine } = await supabase.from('agritourism_listings').select('*').eq('user_id', user.id);
          if (mine?.length) setMyListings(mine.map(m => ({ id:m.id, title:m.title, farmer:'You', village:m.location, price:m.price_per_person||0, rating:m.rating||0, reviews:m.reviews||0, duration:'Half Day', category:'Tour', image:'🌿', highlights:(m.activities||'').split(',').filter(Boolean), maxGuests:10, isMine:true, earnings:0, bookings:0 })));
        }
      } catch {}
    })();
  }, [user?.id]);

  const categories = ['All', 'Farm Stay', 'Tour', 'Festival'];
  const filtered = filter === 'All' ? listings : listings.filter(e => e.category === filter);
  const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' };

  const addListing = async () => {
    if (!newExp.title || !newExp.price) return;
    const item = { id:Date.now(), title:newExp.title, farmer:'You', village:farmerProfile?.district||'AP', price:Number(newExp.price), rating:0, reviews:0, duration:newExp.duration, category:newExp.category, image:'🌿', highlights:newExp.highlights.split(',').map(h=>h.trim()).filter(Boolean), maxGuests:Number(newExp.maxGuests)||10, isMine:true, earnings:0, bookings:0 };
    setMyListings(prev => [...prev, item]);
    setListings(prev => [...prev, item]);
    if (user?.id) {
      supabase.from('agritourism_listings').insert({ user_id:user.id, title:newExp.title, description:newExp.desc, location:farmerProfile?.district||'AP', district:farmerProfile?.district, price_per_person:Number(newExp.price), activities:newExp.highlights, contact:farmerProfile?.name||'Farmer' }).then(()=>{});
    }
    setShowAdd(false);
    setNewExp({ title:'', price:'', duration:'Half Day', category:'Tour', highlights:'', maxGuests:'', desc:'' });
  };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🌿 AgriTourism</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>Experience farm life or list your own farm for visitors</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding:'8px 14px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>➕ List My Farm</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--bg-primary)', borderRadius:10, padding:4 }}>
        {[{id:'browse',l:'🔍 Browse Experiences'},{id:'my',l:'🏠 My Listings'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight:tab===t.id?700:500, cursor:'pointer', background:tab===t.id?'var(--bg-card)':'transparent', color:tab===t.id?'#22c55e':'var(--text-muted)' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'browse' && <>
        <div className="card" style={{ padding:12, marginBottom:16, display:'flex', gap:6 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding:'7px 16px', borderRadius:999, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s', border:'1px solid', borderColor:filter===c?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.1)', background:filter===c?'rgba(16,185,129,0.15)':'transparent', color:filter===c?'#34d399':'var(--text-secondary)' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
          {filtered.map(e => (
            <div key={e.id} className="card" style={{ padding:0, overflow:'hidden', transition:'transform 0.2s' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform='translateY(-3px)'; ev.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.3)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform='none'; ev.currentTarget.style.boxShadow='none'; }}>
              <div style={{ fontSize:'3rem', textAlign:'center', padding:'28px 16px', background:'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(245,158,11,0.06))' }}>{e.image}</div>
              <div style={{ padding:'16px 18px' }}>
                <span style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:999, background:'rgba(59,130,246,0.12)', color:'#93c5fd', fontWeight:600, display:'inline-block', marginBottom:8 }}>{e.category}</span>
                <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:4, lineHeight:1.3 }}>{e.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 {e.farmer} • 📍 {e.village}</div>
                {[['Duration',e.duration],['Max Guests',e.maxGuests],['Rating',`⭐ ${e.rating} (${e.reviews})`]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', padding:'5px 0', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
                  {e.highlights.map((h,i) => <span key={i} style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--text-secondary)' }}>{h}</span>)}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize:'1.2rem', fontWeight:800, color:'#10b981' }}>₹{e.price}<span style={{ fontSize:'0.72rem', fontWeight:400, color:'var(--text-muted)' }}>/person</span></span>
                  <button onClick={() => {
                    const wasBooked = booked.includes(e.id);
                    setBooked(prev => wasBooked ? prev.filter(x=>x!==e.id) : [...prev,e.id]);
                    if (!wasBooked && user?.id) {
                      supabase.from('agritourism_bookings').insert({
                        user_id: user.id, listing_id: e.id, guests: 1,
                        booking_date: new Date().toISOString().split('T')[0],
                        total_price: e.price, status: 'confirmed',
                        contact_name: farmerProfile?.name || '', contact_phone: farmerProfile?.phone || ''
                      }).then(() => {});
                      supabase.from('notifications').insert({ user_id: user.id, title: '🌿 AgriTourism Booked', body: `${e.title} — ₹${e.price}/person`, type: 'finance', read: false }).then(() => {});
                    }
                  }} style={{ padding:'9px 20px', borderRadius:10, fontWeight:700, fontSize:'0.8rem', cursor:'pointer', border:booked.includes(e.id)?'1px solid rgba(16,185,129,0.3)':'none', background:booked.includes(e.id)?'transparent':'linear-gradient(135deg,#059669,#10b981)', color:booked.includes(e.id)?'#34d399':'#fff' }}>
                    {booked.includes(e.id) ? '✓ Booked' : '📅 Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* MY LISTINGS */}
      {tab === 'my' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
            <div className="card" style={{ padding:14, textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:4 }}>🏠</div>
              <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#22c55e' }}>{myListings.length}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Active Listings</div>
            </div>
            <div className="card" style={{ padding:14, textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:4 }}>💰</div>
              <div style={{ fontWeight:800, fontSize:'1.2rem', color:'#f59e0b' }}>₹{myListings.reduce((s,l)=>s+l.earnings,0).toLocaleString()}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Total Earnings</div>
            </div>
          </div>
          {myListings.map(l => (
            <div key={l.id} className="card" style={{ padding:16, marginBottom:10, borderLeft:'3px solid #22c55e' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{l.image} {l.title}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{l.category} • {l.duration} • Max {l.maxGuests} guests</div>
                </div>
                <span style={{ fontWeight:800, color:'#22c55e', fontSize:'1rem' }}>₹{l.price}</span>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:10, fontSize:'0.78rem' }}>
                <span>📅 {l.bookings} bookings</span>
                <span>💰 ₹{l.earnings.toLocaleString()} earned</span>
                <span>⭐ {l.rating || 'New'}</span>
              </div>
            </div>
          ))}
          <button onClick={() => setShowAdd(true)} style={{ width:'100%', padding:14, borderRadius:10, border:'2px dashed var(--border)', background:'transparent', color:'var(--text-muted)', fontWeight:700, cursor:'pointer', fontSize:'0.85rem', marginTop:8 }}>➕ Add New Farm Experience</button>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width:440, padding:24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:14 }}>🌿 List Your Farm for Tourism</div>
            <input value={newExp.title} onChange={e => setNewExp(p=>({...p,title:e.target.value}))} placeholder="Experience title (e.g. Paddy Field Walk)" style={{ ...INP, marginBottom:10 }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <input type="number" value={newExp.price} onChange={e => setNewExp(p=>({...p,price:e.target.value}))} placeholder="Price per person (₹)" style={INP} />
              <input type="number" value={newExp.maxGuests} onChange={e => setNewExp(p=>({...p,maxGuests:e.target.value}))} placeholder="Max guests" style={INP} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <select value={newExp.duration} onChange={e => setNewExp(p=>({...p,duration:e.target.value}))} style={INP}>
                {['3 Hours','Half Day','1 Day','2 Days'].map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={newExp.category} onChange={e => setNewExp(p=>({...p,category:e.target.value}))} style={INP}>
                {['Tour','Farm Stay','Festival'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <input value={newExp.highlights} onChange={e => setNewExp(p=>({...p,highlights:e.target.value}))} placeholder="Highlights (comma separated)" style={{ ...INP, marginBottom:10 }} />
            <textarea value={newExp.desc} onChange={e => setNewExp(p=>({...p,desc:e.target.value}))} placeholder="Describe the experience..." style={{ ...INP, height:80, resize:'none', marginBottom:14 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={addListing} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer', opacity:newExp.title&&newExp.price?1:0.5 }}>✅ Publish Listing</button>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
