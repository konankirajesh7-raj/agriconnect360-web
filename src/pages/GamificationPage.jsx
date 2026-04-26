import React, { useEffect, useMemo, useState } from 'react';
import {
  COIN_RULES, SPEND_RULES, getCoins, getCoinLog, addCoins, spendCoins,
  recordLogin, getStreakInfo,
  BADGES, getEarnedBadges, earnBadge,
  GEO_TIERS, LB_CATEGORIES, TIME_PERIODS, getLeaderboard,
  getChallenges, getContests, getReferralInfo
} from '../lib/services/gamificationService';

const fmt = n => new Intl.NumberFormat('en-IN').format(n);

export default function GamificationPage() {
  const [tab, setTab] = useState('coins');
  const tabs = [
    { id: 'coins', icon: '🪙', label: 'AgriCoins' },
    { id: 'streaks', icon: '🔥', label: 'Streaks' },
    { id: 'badges', icon: '🏅', label: 'Badges' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboards' },
    { id: 'challenges', icon: '⚡', label: 'Challenges' },
    { id: 'contests', icon: '🎪', label: 'Contests' },
    { id: 'referrals', icon: '👨‍🌾', label: 'Referrals' },
  ];

  useEffect(() => { recordLogin(); }, []);

  return (
    <div className="animated gam-page">
      <div className="section-header">
        <div>
          <div className="section-title">🎮 Gamification Hub</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Earn coins, build streaks, unlock badges, and climb leaderboards</div>
        </div>
      </div>
      <div className="fin-tabs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`fin-tab ${tab === t.id ? 'active' : ''}`}>
            <span className="fin-tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      <div style={{ animation: 'fadeIn 0.3s ease' }}>
        {tab === 'coins' && <CoinsTab />}
        {tab === 'streaks' && <StreaksTab />}
        {tab === 'badges' && <BadgesTab />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'challenges' && <ChallengesTab />}
        {tab === 'contests' && <ContestsTab />}
        {tab === 'referrals' && <ReferralsTab />}
      </div>
    </div>
  );
}

function CoinsTab() {
  const [coins, setCoins] = useState(() => getCoins());
  const [log, setLog] = useState(() => getCoinLog());
  const [spendError, setSpendError] = useState('');

  function syncWallet() {
    setCoins(getCoins());
    setLog(getCoinLog());
  }

  function handleEarn(rule) {
    addCoins(rule.coins, rule.label);
    setSpendError('');
    syncWallet();
  }

  function handleSpend(rule) {
    const spent = spendCoins(rule.coins, `Redeemed: ${rule.label}`);
    if (spent === false) {
      setSpendError('Insufficient AgriCoins for this redemption.');
      return;
    }
    setSpendError('');
    syncWallet();
  }

  return (
    <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <h3 className="fin-section-title">🪙 AgriCoins</h3>
      <div className="fin-summary-row">
        <div className="fin-summary-card"><div className="fin-card-label">Balance</div><div className="fin-card-value" style={{ color: '#f59e0b' }}>{fmt(coins)} 🪙</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Lifetime Earned</div><div className="fin-card-value" style={{ color: '#10b981' }}>{fmt(log.filter(l => l.amount > 0).reduce((s, l) => s + l.amount, 0))}</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Transactions</div><div className="fin-card-value" style={{ color: '#3b82f6' }}>{log.length}</div></div>
      </div>
      <h4 style={{ margin: '20px 0 12px' }}>Earn Rules</h4>
      <div className="fin-content-grid">
        {COIN_RULES.map(r => (
          <div key={r.action} className="fin-compare-card" style={{ cursor: 'pointer' }} onClick={() => handleEarn(r)}>
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{r.icon}</div>
            <div className="fin-lender-name">{r.label}</div>
            <div className="fin-lender-type">+{r.coins} coins • max {r.max}x</div>
          </div>
        ))}
      </div>
      <h4 style={{ margin: '20px 0 12px' }}>Spend Rules</h4>
      <div className="gam-spend-grid">
        {SPEND_RULES.map(r => (
          <div key={r.action} className="fin-compare-card gam-spend-card">
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{r.icon}</div>
            <div className="fin-lender-name">{r.label}</div>
            <div className="fin-lender-type">-{r.coins} coins • max {r.max}x</div>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => handleSpend(r)}>
              Redeem
            </button>
          </div>
        ))}
      </div>
      {spendError && <div className="gam-alert">{spendError}</div>}
      <h4 style={{ margin: '20px 0 12px' }}>Transaction Ledger</h4>
      <table className="fin-table">
        <thead><tr><th>Date</th><th>Reason</th><th>Amount</th></tr></thead>
        <tbody>
          {log.slice(0, 15).map((entry, i) => (
            <tr key={i}>
              <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
              <td>{entry.reason}</td>
              <td style={{ color: entry.amount > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{entry.amount > 0 ? '+' : ''}{entry.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StreaksTab() {
  const [streak] = useState(getStreakInfo);
  return (
    <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <h3 className="fin-section-title">🔥 Login Streaks</h3>
      <div className="fin-gauge-wrap">
        <div style={{ fontSize: '4rem', animation: streak.currentStreak >= 7 ? 'finPulse 2s infinite' : 'none' }}>🔥</div>
        <div className="fin-gauge-score">{streak.currentStreak}</div>
        <div className="fin-gauge-text">day streak</div>
      </div>
      <div className="fin-summary-row" style={{ marginTop: 20 }}>
        <div className="fin-summary-card"><div className="fin-card-label">Current Streak</div><div className="fin-card-value" style={{ color: '#f59e0b' }}>{streak.currentStreak} 🔥</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Longest Streak</div><div className="fin-card-value" style={{ color: '#8b5cf6' }}>{streak.longestStreak}</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Total Logins</div><div className="fin-card-value" style={{ color: '#3b82f6' }}>{streak.totalLogins}</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Streak Insurance</div><div className="fin-card-value" style={{ color: '#10b981' }}>{streak.streakInsurance ? '1 free miss' : 'None'}</div><div className="fin-card-sub">Earn at 14-day streak</div></div>
      </div>
      <h4 style={{ margin: '20px 0 12px' }}>Milestones</h4>
      <div className="fin-pipeline">
        {streak.milestones.map((m, i) => (
          <React.Fragment key={m.days}>
            <div className={`fin-pipeline-step ${m.reached ? 'done' : ''}`}>
              <div className="fin-pipeline-dot">{m.reached ? '✓' : m.days}</div>
              <div className="fin-pipeline-label">{m.days}d → +{m.reward}🪙</div>
            </div>
            {i < streak.milestones.length - 1 && <div className={`fin-pipeline-line ${m.reached ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BadgesTab() {
  const [earned, setEarned] = useState(() => getEarnedBadges());
  const [filter, setFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const categories = ['all', ...new Set(BADGES.map(b => b.category))];
  const rarityColors = { Common: '#94a3b8', Uncommon: '#10b981', Rare: '#3b82f6', Legendary: '#f59e0b' };
  const filtered = filter === 'all' ? BADGES : BADGES.filter(b => b.category === filter);
  const rarityProgress = useMemo(() => {
    const groups = ['Common', 'Uncommon', 'Rare', 'Legendary'];
    return groups.map((rarity) => {
      const pool = BADGES.filter((badge) => badge.rarity === rarity);
      const unlocked = pool.filter((badge) => earned.includes(badge.id)).length;
      return {
        rarity,
        unlocked,
        total: pool.length,
        percent: pool.length ? Math.round((unlocked / pool.length) * 100) : 0,
      };
    });
  }, [earned]);

  useEffect(() => {
    if (!showConfetti) return undefined;
    const timer = setTimeout(() => setShowConfetti(false), 1400);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  function unlockBadge(badge) {
    if (earned.includes(badge.id)) return;
    if (earnBadge(badge.id)) {
      setEarned(getEarnedBadges());
      setShowConfetti(true);
    }
  }

  return (
    <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <h3 className="fin-section-title">🏅 Badges ({earned.length}/{BADGES.length})</h3>
      <div className="fin-util-bar"><div className="fin-util-fill green" style={{ width: `${(earned.length / BADGES.length) * 100}%` }} /></div>
      {showConfetti && (
        <div className="gam-confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => <span key={i} className="gam-confetti-piece" />)}
        </div>
      )}
      <div className="fin-filter-row" style={{ marginTop: 16 }}>
        {categories.map(c => (
          <button key={c} className={`fin-tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>
      <div className="gam-rarity-grid">
        {rarityProgress.map((item) => (
          <div key={item.rarity} className="gam-rarity-card">
            <div className="fin-compare-row">
              <span className="fin-compare-label" style={{ color: rarityColors[item.rarity] }}>{item.rarity}</span>
              <span className="fin-compare-value">{item.unlocked}/{item.total}</span>
            </div>
            <div className="fin-util-bar"><div className="fin-util-fill blue" style={{ width: `${item.percent}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="fin-content-grid" style={{ marginTop: 16 }}>
        {filtered.map(b => {
          const unlocked = earned.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={`fin-compare-card gam-badge-card ${unlocked ? 'selected' : ''}`}
              style={{ opacity: unlocked ? 1 : 0.58, textAlign: 'center' }}
              onClick={() => unlockBadge(b)}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>{b.icon}</div>
              <div className="fin-lender-name">{b.name}</div>
              <div className="fin-lender-type">{b.desc}</div>
              <span className="fin-badge" style={{ background: `${rarityColors[b.rarity]}22`, color: rarityColors[b.rarity], marginTop: 8 }}>{b.rarity}</span>
              {unlocked
                ? <div className="fin-badge green" style={{ marginTop: 6 }}>✓ Earned</div>
                : <div className="fin-card-sub" style={{ marginTop: 6 }}>Tap to unlock demo badge</div>
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const [category, setCategory] = useState('Coins');
  const [geo, setGeo] = useState('District');
  const [period, setPeriod] = useState('This Month');
  const data = useMemo(() => getLeaderboard(category, geo, period), [category, geo, period]);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🏆 Leaderboards</h3>
      <div className="gam-board-summary">
        <span className="fin-badge blue">{LB_CATEGORIES.length} categories</span>
        <span className="fin-badge yellow">{GEO_TIERS.length} geo tiers</span>
        <span className="fin-badge green">{TIME_PERIODS.length} time periods</span>
      </div>
      <div className="fin-filter-row">
        <select className="fin-filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {LB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="fin-filter-select" value={geo} onChange={e => setGeo(e.target.value)}>
          {GEO_TIERS.map(g => <option key={g}>{g}</option>)}
        </select>
        <select className="fin-filter-select" value={period} onChange={e => setPeriod(e.target.value)}>
          {TIME_PERIODS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <table className="fin-table" style={{ marginTop: 16 }}>
        <thead><tr><th>#</th><th>Farmer</th><th>Location</th><th>{category}</th></tr></thead>
        <tbody>
          {data.map(entry => (
            <tr key={entry.rank} style={entry.isCurrentUser ? { background: 'rgba(16,185,129,0.08)' } : {}}>
              <td style={{ fontWeight: 700 }}>{entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : entry.rank}</td>
              <td style={{ fontWeight: entry.isCurrentUser ? 700 : 400 }}>{entry.name} {entry.isCurrentUser && '(You)'}</td>
              <td style={{ color: 'var(--text-muted)' }}>{entry.village}</td>
              <td style={{ fontWeight: 700, color: '#10b981' }}>{fmt(entry.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChallengesTab() {
  const challenges = getChallenges();
  const sections = [
    { key: 'daily', title: '📅 Daily Challenges', items: challenges.daily },
    { key: 'weekly', title: '📆 Weekly Challenges', items: challenges.weekly },
    { key: 'seasonal', title: '🌾 Seasonal Challenges', items: challenges.seasonal },
  ];
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">⚡ Challenges</h3>
      {sections.map(s => (
        <div key={s.key} style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 12 }}>{s.title}</h4>
          <div className="fin-content-grid">
            {s.items.map(ch => {
              const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
              const done = ch.progress >= ch.target;
              return (
                <div key={ch.id} className={`fin-compare-card ${done ? 'selected' : ''}`}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{ch.icon}</div>
                  <div className="fin-lender-name">{ch.title}</div>
                  <div className="fin-lender-type">{ch.desc}</div>
                  <div className="fin-util-bar" style={{ margin: '10px 0' }}>
                    <div className={`fin-util-fill ${done ? 'green' : 'yellow'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="fin-compare-row">
                    <span className="fin-compare-label">{ch.progress}/{ch.target}</span>
                    <span className="fin-compare-value">+{ch.reward} 🪙</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContestsTab() {
  const contests = getContests();
  const statusColors = { active: '#10b981', upcoming: '#3b82f6', completed: '#94a3b8' };
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">🎪 Seasonal Contests</h3>
      <div className="fin-content-grid">
        {contests.map(c => (
          <div key={c.id} className="fin-compare-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
              <span className="fin-badge" style={{ background: `${statusColors[c.status]}22`, color: statusColors[c.status] }}>{c.status}</span>
            </div>
            <div className="fin-lender-name">{c.title}</div>
            <div className="fin-lender-type">{c.category} • {c.participants.toLocaleString()} participants</div>
            <div className="fin-compare-row"><span className="fin-compare-label">Ends</span><span className="fin-compare-value">{c.endDate}</span></div>
            <div className="fin-compare-row"><span className="fin-compare-label">Prizes</span><span className="fin-compare-value">{c.prizes.join(', ')}</span></div>
            {c.winners && <div className="fin-compare-row"><span className="fin-compare-label">Winners</span><span className="fin-compare-value">{c.winners.join(', ')}</span></div>}
            {c.status === 'active' && <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>{c.votingOpen ? '🗳️ Vote Now' : '📝 Participate'}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralsTab() {
  const ref = useMemo(() => getReferralInfo(), []);
  const [copyFeedback, setCopyFeedback] = useState('');
  const shareUrl = `https://agriconnect360.in/join?ref=${ref.code}`;
  function copyCode() {
    navigator.clipboard?.writeText(ref.code);
    setCopyFeedback('Referral code copied');
    setTimeout(() => setCopyFeedback(''), 1500);
  }
  function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(`Join AgriConnect 360! Use my code ${ref.code}. Download: ${shareUrl}`)}`, '_blank'); }
  const nextMilestone = 10;
  const referralPercent = Math.min(100, Math.round((ref.totalReferred / nextMilestone) * 100));

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="fin-section-title">👨‍🌾 Referral Program</h3>
      <div className="fin-summary-row">
        <div className="fin-summary-card"><div className="fin-card-label">Your Code</div><div className="fin-card-value" style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: 2 }}>{ref.code}</div><div className="fin-card-sub" style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={copyCode}>📋 Copy</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Total Referred</div><div className="fin-card-value" style={{ color: '#10b981' }}>{ref.totalReferred}</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Coins Earned</div><div className="fin-card-value" style={{ color: '#f59e0b' }}>{fmt(ref.totalEarned)} 🪙</div></div>
        <div className="fin-summary-card"><div className="fin-card-label">Pending</div><div className="fin-card-value" style={{ color: '#3b82f6' }}>{ref.pendingRewards}</div></div>
      </div>
      <div style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
        <button className="btn btn-primary" onClick={shareWhatsApp}>💬 Share on WhatsApp</button>
        <button className="btn btn-outline" onClick={copyCode}>📋 Copy Code</button>
      </div>
      {copyFeedback && <div className="gam-alert success">{copyFeedback}</div>}
      <div className="gam-ref-progress">
        <div className="fin-compare-row">
          <span className="fin-compare-label">Progress to Village Champion (10 referrals)</span>
          <span className="fin-compare-value">{ref.totalReferred}/{nextMilestone}</span>
        </div>
        <div className="fin-util-bar"><div className="fin-util-fill green" style={{ width: `${referralPercent}%` }} /></div>
      </div>
      <h4 style={{ marginBottom: 12 }}>Referral History</h4>
      <table className="fin-table">
        <thead><tr><th>Name</th><th>Date</th><th>Status</th><th>Reward</th></tr></thead>
        <tbody>
          {ref.referrals.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td>{r.date}</td>
              <td><span className={`fin-badge ${r.status === 'active' ? 'green' : 'yellow'}`}>{r.status}</span></td>
              <td style={{ fontWeight: 700, color: '#10b981' }}>+{r.reward} 🪙</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
