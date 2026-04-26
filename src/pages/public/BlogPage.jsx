import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ARTICLES = [
  { id: 1, title: 'How to Maximize Kharif Paddy Yields in AP', category: 'Crops', readTime: 6, date: '2026-04-15', excerpt: 'Best practices for nursery preparation, transplanting timelines, and nutrient management for Kharif paddy in Andhra Pradesh districts.', image: '🌾' },
  { id: 2, title: 'Understanding PMFBY: Complete Insurance Guide', category: 'Insurance', readTime: 8, date: '2026-04-10', excerpt: 'Step-by-step guide to enroll, claim process timelines, and maximizing your crop insurance coverage under PMFBY.', image: '🛡️' },
  { id: 3, title: 'Drip Irrigation: ROI Calculator for Small Farmers', category: 'Technology', readTime: 5, date: '2026-04-08', excerpt: 'Calculate your return on investment for drip irrigation systems based on your land size and crop mix.', image: '💧' },
  { id: 4, title: 'KCC Interest Rates: How to Save Up to ₹15,000/Year', category: 'Finance', readTime: 4, date: '2026-04-05', excerpt: 'Understanding interest subvention, timely repayment benefits, and how to optimize your Kisan Credit Card usage.', image: '🏦' },
  { id: 5, title: 'Organic Farming Certification: A to Z Process', category: 'Organic', readTime: 10, date: '2026-03-28', excerpt: 'Complete roadmap from conventional to certified organic farming, including PGS and NPOP pathways.', image: '🌿' },
  { id: 6, title: 'Soil Health Card: Reading and Acting on Results', category: 'Soil', readTime: 7, date: '2026-03-22', excerpt: 'How to interpret NPK values, pH levels, and micronutrient data from your soil health card report.', image: '🧪' },
  { id: 7, title: 'Top 10 Government Schemes for AP Farmers in 2026', category: 'Schemes', readTime: 9, date: '2026-03-18', excerpt: 'Comprehensive guide to PM-KISAN, YSR Rythu Bharosa, PMFBY, and 7 more schemes you should know.', image: '🏛️' },
  { id: 8, title: 'Pest Alert: Fall Armyworm Management in Maize', category: 'Crops', readTime: 5, date: '2026-03-12', excerpt: 'Identification, bio-control agents, chemical management, and IPM strategies for Fall Armyworm.', image: '🐛' },
  { id: 9, title: 'FPO Formation: Benefits & Step-by-Step Guide', category: 'Community', readTime: 8, date: '2026-03-05', excerpt: 'How to form a Farmer Producer Organization, government support, and collective bargaining benefits.', image: '🏢' },
  { id: 10, title: 'AI in Agriculture: 5 Ways It Helps Small Farmers', category: 'Technology', readTime: 6, date: '2026-02-28', excerpt: 'From disease detection to yield prediction — practical AI applications accessible to every farmer.', image: '🤖' },
  { id: 11, title: 'Natural Farming vs Organic: What AP Farmers Should Know', category: 'Organic', readTime: 7, date: '2026-02-20', excerpt: 'Comparing ZBNF, organic farming, and conventional methods in terms of cost, yield, and soil health.', image: '🌱' },
  { id: 12, title: 'Post-Harvest Losses: Storage Solutions Under ₹50,000', category: 'Technology', readTime: 5, date: '2026-02-15', excerpt: 'Affordable hermetic storage, solar dryers, and cold chain options to reduce post-harvest losses by 30%.', image: '📦' },
];

const CATEGORIES = ['All', ...new Set(ARTICLES.map(a => a.category))];

export default function BlogPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => ARTICLES.filter(a => {
    const matchCat = category === 'All' || a.category === category;
    const matchQ = a.title.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  }), [category, query]);

  return (
    <div className="pub-page animated">
      <div className="pub-hero-mini">
        <h1>📚 Knowledge Hub</h1>
        <p>Expert farming articles, scheme guides, and technology insights for Indian farmers.</p>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input className="pub-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search articles..." style={{ flex: 1 }} />
        </div>
        <div className="pub-cat-tabs">
          {CATEGORIES.map(c => (
            <button key={c} className={`pub-cat-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <div className="pub-blog-grid">
          {filtered.map(a => (
            <article key={a.id} className="pub-blog-card">
              <div className="pub-blog-thumb">{a.image}</div>
              <div className="pub-blog-body">
                <div className="pub-blog-meta">
                  <span className="pub-blog-cat">{a.category}</span>
                  <span>⏱️ {a.readTime} min read</span>
                  <span>{a.date}</span>
                </div>
                <h3 className="pub-blog-title">{a.title}</h3>
                <p className="pub-blog-excerpt">{a.excerpt}</p>
                <button className="btn btn-outline" style={{ marginTop: 8 }}>Read More →</button>
              </div>
            </article>
          ))}
        </div>
        <div className="pub-cta-box">
          <h3>✍️ Want personalized farming knowledge?</h3>
          <p>Login to access AI-curated content based on your crops, soil, and region.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Join AgriConnect 360 →</button>
        </div>
      </div>
    </div>
  );
}
