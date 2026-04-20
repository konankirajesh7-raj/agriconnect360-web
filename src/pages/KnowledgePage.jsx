import React, { useState } from 'react';

const ARTICLES = [
  { id: 1, title: 'Complete Guide to Paddy Cultivation', category: 'Crop Guide', duration: '8 min', icon: '🌾', author: 'Dr. Rajesh K', date: '2025-03-10', views: 2340, tags: ['Paddy', 'Kharif'], content: 'Learn the complete A-Z of paddy farming from nursery preparation to harvest...' },
  { id: 2, title: 'Soil pH Management for Better Yields', category: 'Soil Health', duration: '5 min', icon: '🧪', author: 'Priya Sharma', date: '2025-03-05', views: 1890, tags: ['Soil', 'pH'], content: 'Understanding soil pH and how to correct acidic or alkaline conditions...' },
  { id: 3, title: 'Integrated Pest Management (IPM)', category: 'Pest Control', duration: '10 min', icon: '🐛', author: 'Dr. Anitha M', date: '2025-02-28', views: 3120, tags: ['IPM', 'Organic'], content: 'Reduce chemical usage with biological and cultural pest control methods...' },
  { id: 4, title: 'Drip Irrigation Setup Guide', category: 'Irrigation', duration: '7 min', icon: '💧', author: 'Venkatesh R', date: '2025-02-20', views: 1560, tags: ['Irrigation', 'Water'], content: 'Step-by-step installation of inline drip irrigation system...' },
  { id: 5, title: 'Cotton: From Seed Selection to Ginning', category: 'Crop Guide', duration: '12 min', icon: '🌿', author: 'Dr. Rajesh K', date: '2025-02-15', views: 2780, tags: ['Cotton', 'Kharif'], content: 'Premium Bt cotton variety selection and management practices...' },
  { id: 6, title: 'Organic Farming Certification Process', category: 'Organic', duration: '6 min', icon: '🌱', author: 'Manjula D', date: '2025-02-10', views: 980, tags: ['Organic', 'Certification'], content: 'Complete process to get organic certification under NPOP/PGS...' },
  { id: 7, title: 'Understanding NPK Ratios', category: 'Fertilizer', duration: '4 min', icon: '🧬', author: 'Priya Sharma', date: '2025-02-05', views: 4200, tags: ['NPK', 'Fertilizer'], content: 'What NPK numbers mean and how to choose the right fertilizer...' },
  { id: 8, title: 'Sugarcane Ratoon Management', category: 'Crop Guide', duration: '8 min', icon: '🎋', author: 'Dr. Rajesh K', date: '2025-01-28', views: 1340, tags: ['Sugarcane', 'Ratoon'], content: 'Maximize ratoon crop yield with proper stubble management...' },
  { id: 9, title: 'Tractor Maintenance Checklist', category: 'Equipment', duration: '5 min', icon: '🚜', author: 'Ganesh N', date: '2025-01-20', views: 2100, tags: ['Tractor', 'Maintenance'], content: 'Monthly and seasonal maintenance checklist for your tractor...' },
  { id: 10, title: 'How to Use e-NAM for Better Prices', category: 'Market', duration: '6 min', icon: '💰', author: 'Venkatesh R', date: '2025-01-15', views: 3450, tags: ['e-NAM', 'Market'], content: 'Register and sell on e-NAM to get the best national prices...' },
  { id: 11, title: 'Climate-Smart Agriculture Practices', category: 'Climate', duration: '9 min', icon: '🌍', author: 'Dr. Anitha M', date: '2025-01-10', views: 1670, tags: ['Climate', 'Sustainability'], content: 'Adapt your farming to changing climate patterns...' },
  { id: 12, title: 'Vermicompost: DIY Guide', category: 'Organic', duration: '7 min', icon: '🪱', author: 'Manjula D', date: '2025-01-05', views: 2890, tags: ['Vermicompost', 'Organic'], content: 'Build your own vermicompost pit with ₹2000 investment...' },
  { id: 13, title: 'Wheat Varieties for Rabi Season', category: 'Crop Guide', duration: '5 min', icon: '🌾', author: 'Dr. Rajesh K', date: '2024-12-28', views: 1920, tags: ['Wheat', 'Rabi'], content: 'Best wheat varieties for Andhra Pradesh and their yield potential...' },
  { id: 14, title: 'Farm Record Keeping Tips', category: 'Management', duration: '4 min', icon: '📝', author: 'Venkatesh R', date: '2024-12-20', views: 1230, tags: ['Records', 'Management'], content: 'Why keeping farm records matters and how to start...' },
  { id: 15, title: 'Post-Harvest Storage Solutions', category: 'Storage', duration: '8 min', icon: '🏭', author: 'Ganesh N', date: '2024-12-15', views: 2560, tags: ['Storage', 'Post-Harvest'], content: 'Reduce post-harvest losses with proper storage methods...' },
  { id: 16, title: 'Government Subsidy for Solar Pumps', category: 'Schemes', duration: '5 min', icon: '☀️', author: 'Manjula D', date: '2024-12-10', views: 3780, tags: ['Solar', 'Subsidy'], content: 'Get up to 90% subsidy on solar water pumps under PM-KUSUM...' },
  { id: 17, title: 'Maize Cultivation Best Practices', category: 'Crop Guide', duration: '7 min', icon: '🌽', author: 'Dr. Rajesh K', date: '2024-12-05', views: 1450, tags: ['Maize', 'Cultivation'], content: 'High-yield maize cultivation from hybrid selection to harvest...' },
  { id: 18, title: 'Water Harvesting Structures', category: 'Irrigation', duration: '6 min', icon: '🌊', author: 'Priya Sharma', date: '2024-11-28', views: 1890, tags: ['Water', 'Harvesting'], content: 'Farm ponds, check dams, and percolation tanks for water conservation...' },
  { id: 19, title: 'Livestock Feed Management', category: 'Livestock', duration: '8 min', icon: '🐄', author: 'Dr. Anitha M', date: '2024-11-20', views: 1120, tags: ['Livestock', 'Feed'], content: 'Balanced feeding schedules for dairy and draught cattle...' },
  { id: 20, title: 'Precision Agriculture with Drones', category: 'Technology', duration: '10 min', icon: '🛸', author: 'Ganesh N', date: '2024-11-15', views: 4560, tags: ['Drone', 'Precision'], content: 'How drones are revolutionizing Indian agriculture...' },
  { id: 21, title: 'Mulching: Types and Benefits', category: 'Soil Health', duration: '5 min', icon: '🍂', author: 'Priya Sharma', date: '2024-11-10', views: 1340, tags: ['Mulching', 'Soil'], content: 'Plastic and organic mulching for moisture retention and weed control...' },
  { id: 22, title: 'Floriculture: Profitable Flower Farming', category: 'Special Crops', duration: '9 min', icon: '🌸', author: 'Manjula D', date: '2024-11-05', views: 2100, tags: ['Flowers', 'Business'], content: 'Earn ₹2-5 lakh/acre with jasmine, marigold and tuberose farming...' },
];

const VIDEOS = [
  { id: 1, title: 'Paddy Transplanting Technique', duration: '15:30', views: '12K', thumb: '🌾', lang: 'KN' },
  { id: 2, title: 'Neem Oil Spray Preparation', duration: '8:45', views: '8.5K', thumb: '🌿', lang: 'HI' },
  { id: 3, title: 'Drip Irrigation Installation', duration: '22:10', views: '15K', thumb: '💧', lang: 'EN' },
  { id: 4, title: 'Cotton Picking Best Practices', duration: '11:20', views: '6.3K', thumb: '🌿', lang: 'TE' },
  { id: 5, title: 'Vermicompost Pit Setup', duration: '18:00', views: '9.2K', thumb: '🪱', lang: 'HI' },
  { id: 6, title: 'Tractor Engine Maintenance', duration: '25:00', views: '7.8K', thumb: '🚜', lang: 'KN' },
];

const CATS = [...new Set(ARTICLES.map(a => a.category))];

export default function KnowledgePage() {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('articles');

  const filtered = ARTICLES.filter(a => {
    const q = search.toLowerCase();
    return (catFilter === 'all' || a.category === catFilter) && (!q || a.title.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
  });

  const tabs = [{ id: 'articles', icon: '📚', label: `Articles (${ARTICLES.length})` }, { id: 'videos', icon: '🎬', label: `Videos (${VIDEOS.length})` }];

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">📚 Knowledge Library</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{ARTICLES.length}+ articles • {VIDEOS.length} video tutorials • Multi-language</div></div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: tab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{t.icon} {t.label}</button>)}
      </div>

      {tab === 'articles' && <>
        <div className="card" style={{ padding: '12px 16px', marginBottom: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search articles by topic, tag, or keyword..." style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setCatFilter('all')} className={`filter-btn${catFilter === 'all' ? ' active' : ''}`}>All</button>
          {CATS.map(c => <button key={c} onClick={() => setCatFilter(c)} className={`filter-btn${catFilter === c ? ' active' : ''}`}>{c}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ padding: '18px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4 }}>{a.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.author} • {a.duration} read</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{a.content.substring(0, 80)}...</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>{a.tags.slice(0, 2).map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{t}</span>)}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👁 {a.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </>}

      {tab === 'videos' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {VIDEOS.map(v => (
          <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
            <div style={{ height: 140, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
              {v.thumb}
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#000', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}>{v.duration}</div>
              <div style={{ position: 'absolute', top: 8, left: 8, background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700 }}>{v.lang}</div>
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{v.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>👁 {v.views} views</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
