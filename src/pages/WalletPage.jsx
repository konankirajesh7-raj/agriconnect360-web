import React, { useState } from 'react';

const WALLET_DATA = {
  balance: 12450,
  coins: 340,
  transactions: [
    { id: 1, type: 'credit', amount: 6000, description: 'PM-KISAN Installment (Apr 2025)', date: '2025-04-15', status: 'completed', method: 'DBT' },
    { id: 2, type: 'debit', amount: 2800, description: 'Fertilizer Purchase — Urea 50kg', date: '2025-04-10', status: 'completed', method: 'UPI' },
    { id: 3, type: 'credit', amount: 1500, description: 'Crop Insurance Claim Payout', date: '2025-03-28', status: 'completed', method: 'NEFT' },
    { id: 4, type: 'credit', amount: 500, description: 'Referral Bonus — Invited 5 farmers', date: '2025-03-15', status: 'completed', method: 'Reward' },
    { id: 5, type: 'debit', amount: 4200, description: 'Transport Booking — Mysuru APMC', date: '2025-03-10', status: 'completed', method: 'Wallet' },
    { id: 6, type: 'credit', amount: 8000, description: 'Cotton Sale Advance — Hubli Mandi', date: '2025-02-25', status: 'completed', method: 'UPI' },
    { id: 7, type: 'debit', amount: 3500, description: 'Seeds Purchase — BPT-5204', date: '2025-02-15', status: 'pending', method: 'UPI' },
  ]
};

const REWARDS = [
  { id: 1, title: 'First Sale Bonus', coins: 50, icon: '🎉', earned: true },
  { id: 2, title: 'Refer a Farmer', coins: 100, icon: '👨‍🌾', earned: true },
  { id: 3, title: 'Complete Profile', coins: 30, icon: '✅', earned: true },
  { id: 4, title: 'Soil Test Done', coins: 40, icon: '🧪', earned: false },
  { id: 5, title: 'First Insurance', coins: 75, icon: '🛡️', earned: false },
  { id: 6, title: 'Use AI Advisory', coins: 25, icon: '🤖', earned: true },
  { id: 7, title: '10 Transactions', coins: 100, icon: '💳', earned: false },
  { id: 8, title: 'Join Community', coins: 20, icon: '🤝', earned: true },
];

const REDEEM_OPTIONS = [
  { label: '₹100 off Seeds', coins: 50, icon: '🌱' },
  { label: '₹200 off Fertilizer', coins: 100, icon: '🧪' },
  { label: 'Free Soil Test', coins: 150, icon: '🔬' },
  { label: '₹500 off Transport', coins: 200, icon: '🚛' },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  const tabs = [
    { id: 'transactions', icon: '💳', label: 'Transactions' },
    { id: 'rewards', icon: '🏆', label: 'Rewards & Coins' },
    { id: 'redeem', icon: '🎁', label: 'Redeem' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">💳 Credit Wallet & Rewards</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Balance management • Coin rewards • Redeemable offers</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Money</button>
      </div>

      {/* Wallet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #22c55e15, #3b82f610)', borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Wallet Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>₹{WALLET_DATA.balance.toLocaleString()}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Available for withdrawal</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #f59e0b15, #f97316 10)', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>🪙 Agri Coins</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{WALLET_DATA.coins}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Earn more by completing tasks</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #8b5cf615, #6366f110)', borderLeft: '3px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Cashback Earned</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>₹1,240</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Lifetime rewards</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <div className="card" style={{ padding: '20px' }}>
          {WALLET_DATA.transactions.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: tx.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {tx.type === 'credit' ? '⬇️' : '⬆️'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {tx.method}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: tx.type === 'credit' ? '#22c55e' : '#ef4444' }}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </div>
                <span className={`badge ${tx.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {REWARDS.map(r => (
            <div key={r.id} className="card" style={{ padding: '18px', textAlign: 'center', opacity: r.earned ? 1 : 0.5, transition: 'transform 0.2s' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{r.title}</div>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>🪙 {r.coins}</div>
              {r.earned ? <span className="badge badge-success" style={{ marginTop: 8, fontSize: '0.65rem' }}>✓ Earned</span> :
                <span className="badge badge-warning" style={{ marginTop: 8, fontSize: '0.65rem' }}>Locked</span>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'redeem' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {REDEEM_OPTIONS.map(r => (
            <div key={r.label} className="card" style={{ padding: '20px', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{r.label}</div>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>🪙 {r.coins} coins</div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
                disabled={WALLET_DATA.coins < r.coins}>Redeem</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
