import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const AP_DISTRICTS = ['All Locations','Guntur','Krishna','Anantapur','Chittoor','Kurnool','East Godavari','West Godavari','Nellore','Prakasam','Srikakulam','Vizianagaram','Visakhapatnam','Kadapa'];

const SHOPS = [
  {
    id:1, name:'Raju Agri Store', owner:'P. Raju Naidu', phone:'9876501111', loc:'Main Road, Guntur', district:'Guntur', dist:'0.5 km',
    rating:4.8, reviews:156, open:true, since:'2018', icon:'🏪', type:'Seeds & Fertilizers',
    products:[
      { id:1, name:'BPT-5204 Paddy Seeds', unit:'kg', price:180, mrp:207, stock:'in', img:'🌾', discount:10 },
      { id:2, name:'Urea (46-0-0)', unit:'50kg bag', price:266, mrp:280, stock:'in', img:'🧪', discount:5 },
      { id:3, name:'DAP (18-46-0)', unit:'50kg bag', price:1350, mrp:1450, stock:'low', img:'🧪', discount:7 },
    ],
    reviewList:[
      { user:'Venkat Rao', role:'farmer', rating:5, text:'Best seeds in Guntur. My paddy yield increased 20%!', date:'2026-04-15' },
      { user:'Krishna Murthy', role:'farmer', rating:4, text:'Good quality fertilizers, fair prices', date:'2026-04-10' },
    ]
  },
  {
    id:2, name:'AP Agri Suppliers', owner:'S. Narasimha', phone:'9876502222', loc:'APMC Yard, Vijayawada', district:'Krishna', dist:'2.1 km',
    rating:4.6, reviews:98, open:true, since:'2015', icon:'🏬', type:'Pesticides & Equipment',
    products:[
      { id:4, name:'Imidacloprid 17.8% SL', unit:'250ml', price:320, mrp:380, stock:'in', img:'💊', discount:15 },
      { id:5, name:'Chlorpyrifos 20% EC', unit:'1L', price:450, mrp:520, stock:'in', img:'💊', discount:13 },
    ],
    reviewList:[
      { user:'Suresh Reddy', role:'farmer', rating:5, text:'Wide range of pesticides. Very knowledgeable staff.', date:'2026-04-12' },
    ]
  },
  {
    id:3, name:'Sri Sai Seeds & Fertilizers', owner:'K. Srinivas', phone:'9876503333', loc:'Market Road, Narasaraopet', district:'Guntur', dist:'0.8 km',
    rating:4.9, reviews:230, open:true, since:'2012', icon:'🌱', type:'Seeds Specialist',
    products:[
      { id:7, name:'Cotton Seeds (BT-II)', unit:'packet', price:830, mrp:950, stock:'in', img:'🌿', discount:12 },
      { id:8, name:'Chilli Seeds (Teja)', unit:'100g', price:550, mrp:650, stock:'in', img:'🌶️', discount:15 },
    ],
    reviewList:[
      { user:'Anil Babu', role:'farmer', rating:5, text:'Best cotton seeds!', date:'2026-04-18' },
    ]
  },
  {
    id:4, name:'Anantapur Agri Center', owner:'T. Ramesh', phone:'9876506666', loc:'Station Road, Anantapur', district:'Anantapur', dist:'1.2 km',
    rating:4.7, reviews:112, open:true, since:'2017', icon:'🥜', type:'Groundnut & Dryland Seeds',
    products:[
      { id:16, name:'Groundnut Seeds (K-6)', unit:'kg', price:95, mrp:120, stock:'in', img:'🥜', discount:20 },
      { id:17, name:'Sunflower Seeds', unit:'kg', price:180, mrp:220, stock:'in', img:'🌻', discount:18 },
      { id:18, name:'Single Super Phosphate', unit:'50kg', price:350, mrp:400, stock:'in', img:'🧪', discount:12 },
    ],
    reviewList:[
      { user:'Nagesh Reddy', role:'farmer', rating:5, text:'Best groundnut seeds in the district', date:'2026-04-20' },
    ]
  },
  {
    id:5, name:'Godavari Agro Chemicals', owner:'R. Rambabu', phone:'9876505555', loc:'Bus Stand Road, Rajahmundry', district:'East Godavari', dist:'1.3 km',
    rating:4.7, reviews:142, open:true, since:'2016', icon:'🧪', type:'Chemicals & Fertilizers',
    products:[
      { id:13, name:'NPK 19-19-19', unit:'25kg', price:780, mrp:850, stock:'in', img:'🧪', discount:8 },
      { id:14, name:'Micronutrient Mix', unit:'1kg', price:220, mrp:260, stock:'in', img:'🧪', discount:15 },
    ],
    reviewList:[
      { user:'Ravi Kumar', role:'farmer', rating:5, text:'Genuine products at best prices', date:'2026-04-08' },
    ]
  },
  {
    id:6, name:'Chittoor Mango Inputs', owner:'G. Suresh', phone:'9876507777', loc:'Tirupati Road, Chittoor', district:'Chittoor', dist:'3.5 km',
    rating:4.5, reviews:78, open:true, since:'2019', icon:'🥭', type:'Mango & Horticulture',
    products:[
      { id:19, name:'Mango Grafts (Banginapalli)', unit:'plant', price:45, mrp:60, stock:'in', img:'🥭', discount:25 },
      { id:20, name:'Calcium Nitrate', unit:'25kg', price:650, mrp:750, stock:'in', img:'🧪', discount:13 },
    ],
    reviewList:[
      { user:'Lakshmi Devi', role:'farmer', rating:4, text:'Good quality mango plants', date:'2026-04-02' },
    ]
  },
  {
    id:7, name:'Kurnool Farm Store', owner:'P. Siddappa', phone:'9876508888', loc:'APMC Road, Kurnool', district:'Kurnool', dist:'0.9 km',
    rating:4.6, reviews:95, open:true, since:'2014', icon:'🏪', type:'Seeds & Pesticides',
    products:[
      { id:21, name:'Jowar Seeds (CSH-16)', unit:'kg', price:65, mrp:80, stock:'in', img:'🌾', discount:18 },
      { id:22, name:'Neem Oil', unit:'1L', price:280, mrp:350, stock:'in', img:'🌿', discount:20 },
    ],
    reviewList:[]
  },
];

const ROLE_ICONS = { farmer:'👨‍🌾', broker:'🤝', supplier:'🏪', industrial:'🏭', labour:'👷' };

// GPS nearest district detection
const DISTRICT_COORDS = [
  { n:'Guntur', lat:16.3067, lon:80.4365 }, { n:'Krishna', lat:16.5062, lon:80.6480 },
  { n:'Anantapur', lat:14.6819, lon:77.6006 }, { n:'Chittoor', lat:13.2172, lon:79.1003 },
  { n:'Kurnool', lat:15.8281, lon:78.0373 }, { n:'East Godavari', lat:17.0005, lon:81.8040 },
  { n:'Nellore', lat:14.4426, lon:79.9865 }, { n:'Prakasam', lat:15.5057, lon:80.0499 },
  { n:'Srikakulam', lat:18.2949, lon:83.8935 }, { n:'Vizianagaram', lat:18.1067, lon:83.3956 },
  { n:'Visakhapatnam', lat:17.6868, lon:83.2185 }, { n:'Kadapa', lat:14.4674, lon:78.8241 },
  { n:'West Godavari', lat:16.7107, lon:81.0952 },
];

export default function SuppliersPage() {
  const { t, tx } = useLanguage();
  const { data: dbShops, loading: shopsLoading } = useSupabaseQuery('supplier_shops', { select:'*', orderBy:{ column:'rating', ascending:false }, limit:100 }, SHOPS);
  const allShops = (dbShops || SHOPS).map(s => ({
    ...s, products: s.products || [], reviewList: s.reviewList || [],
    icon: s.icon || '🏪', rating: s.rating || 4.0, reviews: s.reviews || s.total_reviews || 0,
    open: s.open !== undefined ? s.open : true, dist: s.dist || '',
  }));
  const [view, setView] = useState('shops');
  const [selectedShop, setSelectedShop] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating:5, text:'' });
  const [shopReviews, setShopReviews] = useState({});
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All Locations');
  const [gpsDistrict, setGpsDistrict] = useState('');

  // Auto-detect district from GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      let best = DISTRICT_COORDS[0], minD = Infinity;
      DISTRICT_COORDS.forEach(d => { const dd = (d.lat-lat)**2 + (d.lon-lon)**2; if (dd < minD) { minD = dd; best = d; } });
      setGpsDistrict(best.n);
      setLocFilter(best.n);
    }, () => {}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }, []);

  const filteredShops = allShops.filter(s => {
    if (locFilter !== 'All Locations' && s.district !== locFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !(s.type||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (product, shop) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1, shopName: shop.name }];
    });
  };

  const submitReview = () => {
    if (!reviewForm.text.trim() || !selectedShop) return;
    const review = { user: 'You', role: 'farmer', rating: reviewForm.rating, text: reviewForm.text, date: new Date().toISOString().split('T')[0] };
    setShopReviews(prev => ({ ...prev, [selectedShop.id]: [...(prev[selectedShop.id] || []), review] }));
    setShowReview(false);
    setReviewForm({ rating: 5, text: '' });
  };

  const allReviews = selectedShop ? [...(selectedShop.reviewList || []), ...(shopReviews[selectedShop.id] || [])] : [];

  // SHOP LIST VIEW
  if (view === 'shops') return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🏪 Suppliers & Shops</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>Browse shops • Compare prices • Order inputs</div>
        </div>
        {cart.length > 0 && (
          <div style={{ padding:'8px 16px', borderRadius:10, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', fontWeight:700, fontSize:'0.85rem' }}>
            🛒 {cart.reduce((s,c) => s+c.qty, 0)} items
          </div>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search shops or products..."
        style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', marginBottom:10, boxSizing:'border-box' }} />

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.82rem' }}>
          {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {gpsDistrict && <span style={{ fontSize:'0.72rem', color:'#22c55e', fontWeight:600 }}>📍 GPS: {gpsDistrict}</span>}
        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>({filteredShops.length} shops)</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:14 }}>
        {filteredShops.length === 0 && (
          <div className="card" style={{ padding:30, textAlign:'center', gridColumn:'1/-1' }}>
            <div style={{ fontSize:'2rem', marginBottom:8 }}>🏪</div>
            <div style={{ fontWeight:600, fontSize:'0.9rem' }}>No shops found in {locFilter}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>Try changing location or search</div>
            <button onClick={() => setLocFilter('All Locations')} style={{ marginTop:10, padding:'8px 16px', borderRadius:8, border:'none', background:'#22c55e', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>🌐 Show All</button>
          </div>
        )}
        {filteredShops.map(shop => (
          <div key={shop.id} className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.2s' }}
            onClick={() => { setSelectedShop(shop); setView('shop-detail'); }}>
            {/* Shop header */}
            <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>{shop.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.95rem' }}>{shop.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{shop.type} • Since {shop.since}</div>
                  </div>
                </div>
                <span style={{ padding:'3px 10px', borderRadius:8, fontSize:'0.68rem', fontWeight:700, background: shop.open ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: shop.open ? '#22c55e' : '#ef4444' }}>
                  {shop.open ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
            </div>

            {/* Shop details */}
            <div style={{ padding:'12px 18px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>📍 {shop.loc}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>📏 {shop.dist}</span>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>👤 {shop.owner}</span>
                <span style={{ fontSize:'0.75rem', color:'#22c55e' }}>📞 {shop.phone}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                  <span style={{ color:'#f59e0b', fontWeight:800 }}>⭐ {shop.rating}</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>({shop.reviews} reviews)</span>
                </div>
                <span style={{ fontSize:'0.75rem', color:'#3b82f6', fontWeight:600 }}>{shop.products.length} products →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // SHOP DETAIL VIEW
  return (
    <div className="animated">
      <button onClick={() => setView('shops')} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', marginBottom:14 }}>
        ← Back to Shops
      </button>

      {selectedShop && (
        <>
          {/* Shop Header Card */}
          <div className="card" style={{ padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:56, height:56, borderRadius:14, background:'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem' }}>{selectedShop.icon}</div>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.15rem' }}>{selectedShop.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{selectedShop.type} • Since {selectedShop.since}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>👤 Owner: {selectedShop.owner}</div>
                </div>
              </div>
              <span style={{ padding:'4px 12px', borderRadius:8, fontSize:'0.72rem', fontWeight:700, background: selectedShop.open ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: selectedShop.open ? '#22c55e' : '#ef4444' }}>
                {selectedShop.open ? '🟢 Open Now' : '🔴 Closed'}
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              <div style={{ textAlign:'center', padding:10, background:'var(--bg-primary)', borderRadius:8 }}>
                <div style={{ fontWeight:800, color:'#f59e0b', fontSize:'1.1rem' }}>⭐ {selectedShop.rating}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Rating</div>
              </div>
              <div style={{ textAlign:'center', padding:10, background:'var(--bg-primary)', borderRadius:8 }}>
                <div style={{ fontWeight:800, color:'#3b82f6', fontSize:'1.1rem' }}>{selectedShop.reviews}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Reviews</div>
              </div>
              <div style={{ textAlign:'center', padding:10, background:'var(--bg-primary)', borderRadius:8 }}>
                <div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.1rem' }}>{selectedShop.products.length}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Products</div>
              </div>
              <a href={`tel:${selectedShop.phone}`} style={{ textAlign:'center', padding:10, background:'rgba(34,197,94,0.1)', borderRadius:8, textDecoration:'none' }}>
                <div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.1rem' }}>📞</div>
                <div style={{ fontSize:'0.65rem', color:'#22c55e' }}>Call</div>
              </a>
            </div>

            <div style={{ marginTop:12, padding:'8px 12px', background:'var(--bg-primary)', borderRadius:8, fontSize:'0.78rem', color:'var(--text-muted)' }}>
              📍 {selectedShop.loc} • 📏 {selectedShop.dist} away
            </div>
          </div>

          {/* Products */}
          <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:10 }}>📦 Products ({selectedShop.products.length})</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12, marginBottom:20 }}>
            {selectedShop.products.map(p => (
              <div key={p.id} className="card" style={{ padding:14 }}>
                <div style={{ textAlign:'center', fontSize:'2.5rem', padding:'12px 0' }}>{p.img}</div>
                {p.discount > 0 && <span style={{ background:'#ef4444', color:'#fff', padding:'2px 8px', borderRadius:6, fontSize:'0.65rem', fontWeight:700 }}>{p.discount}% OFF</span>}
                <div style={{ fontWeight:700, fontSize:'0.85rem', marginTop:6 }}>{p.name}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{selectedShop.name} • {p.unit}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                  <span style={{ fontWeight:800, color:'#22c55e', fontSize:'1rem' }}>₹{p.price}</span>
                  {p.mrp > p.price && <span style={{ textDecoration:'line-through', color:'var(--text-muted)', fontSize:'0.75rem' }}>₹{p.mrp}</span>}
                </div>
                <div style={{ fontSize:'0.7rem', color: p.stock === 'in' ? '#22c55e' : '#f59e0b', marginTop:4 }}>
                  {p.stock === 'in' ? '✅ In Stock' : '⚠️ Low Stock'}
                </div>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p, selectedShop); }}
                  style={{ width:'100%', marginTop:8, padding:'8px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                  🛒 Add
                </button>
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>⭐ Reviews ({allReviews.length})</div>
            <button onClick={() => setShowReview(true)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'#f59e0b', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>
              ✍️ Write Review
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {allReviews.map((r, i) => (
              <div key={i} className="card" style={{ padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span>{ROLE_ICONS[r.role] || '👤'}</span>
                    <span style={{ fontWeight:700, fontSize:'0.85rem' }}>{r.user}</span>
                    <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', textTransform:'capitalize' }}>({r.role})</span>
                  </div>
                  <div style={{ display:'flex', gap:2 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:'0.75rem' }}>{s <= r.rating ? '⭐' : '☆'}</span>)}
                  </div>
                </div>
                <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{r.text}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4 }}>{new Date(r.date).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Write Review Modal */}
      {showReview && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowReview(false)}>
          <div className="card" style={{ width:420, padding:24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:14 }}>✍️ Write a Review for {selectedShop?.name}</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:6, fontWeight:600 }}>Rating</div>
              <div style={{ display:'flex', gap:6 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                    style={{ fontSize:'1.5rem', background:'none', border:'none', cursor:'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:6, fontWeight:600 }}>Your Review</div>
              <textarea value={reviewForm.text} onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                placeholder="Share your experience with this shop..."
                style={{ width:'100%', height:100, padding:12, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', resize:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" style={{ flex:1 }} disabled={!reviewForm.text.trim()} onClick={submitReview}>✅ Submit Review</button>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowReview(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
