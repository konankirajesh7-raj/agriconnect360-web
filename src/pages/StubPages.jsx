// Page stubs — will be expanded with full CRUD UI
import React from 'react';
export const FarmersPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">👨‍🌾 Farmers Management</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Farmer search, profile management, Aadhaar verification, and field tracking UI — connects to /api/v1/farmers</p></div>
  </div>
);
export const MarketPricesPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">💰 Market Prices</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Live e-NAM prices, crop comparison, 90-day history charts, and price alerts — connects to /api/v1/prices</p></div>
  </div>
);
export const LabourPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">👷 Labour Bookings</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Labour associations directory, booking management, and dispute tracking — /api/v1/labour</p></div>
  </div>
);
export const TransportPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">🚛 Transport Network</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Transporter directory, booking status, GPS tracking — /api/v1/transport</p></div>
  </div>
);
export const SuppliersPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">🏪 Suppliers Directory</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Seeds, fertilizers, pesticides suppliers — Elasticsearch powered search — /api/v1/suppliers</p></div>
  </div>
);
export const DisputesPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">⚖️ Dispute Resolution</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Active disputes, resolution status, and officer assignment — /api/v1/disputes</p></div>
  </div>
);
export const SchemesPage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">🏛️ Government Schemes</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>PM-KISAN, crop insurance, subsidies with eligibility checker — /api/v1/schemes</p></div>
  </div>
);
export const KnowledgePage = () => (
  <div className="animated">
    <div className="section-header"><div className="section-title">📚 Knowledge Library</div></div>
    <div className="card"><p style={{color:'var(--text-muted)',padding:'40px',textAlign:'center'}}>Articles management, Q&A moderation, multilingual content — /api/v1/knowledge</p></div>
  </div>
);
