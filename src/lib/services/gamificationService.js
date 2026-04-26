/**
 * AgriConnect 360 — Gamification Service (Phase 12I)
 * Coin economy, streak logic, badge engine, leaderboards, challenges
 */

const STORAGE_KEY = 'agri_gamification';
export const GAMIFICATION_EVENT = 'agri-gamification-updated';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GAMIFICATION_EVENT, { detail: { coins: data.coins || 0, streak: data.currentStreak || 0 } }));
  }
}

/** 12I.1 — Coin Economy */
export const COIN_RULES = [
  { action: 'daily_login', coins: 5, label: 'Daily Login', icon: '📅', max: 1 },
  { action: 'profile_complete', coins: 50, label: 'Complete Profile', icon: '✅', max: 1 },
  { action: 'first_sale', coins: 100, label: 'First Sale Recorded', icon: '🧾', max: 1 },
  { action: 'soil_test', coins: 40, label: 'Soil Test Upload', icon: '🧪', max: 5 },
  { action: 'crop_update', coins: 10, label: 'Crop Status Update', icon: '🌱', max: 50 },
  { action: 'market_check', coins: 5, label: 'Check Market Prices', icon: '💰', max: 30 },
  { action: 'ai_query', coins: 15, label: 'Ask AI Advisory', icon: '🤖', max: 20 },
  { action: 'refer_farmer', coins: 200, label: 'Refer a Farmer', icon: '👨‍🌾', max: 50 },
  { action: 'insurance_enroll', coins: 75, label: 'Enroll in Insurance', icon: '🛡️', max: 3 },
  { action: 'video_watch', coins: 10, label: 'Watch Learning Video', icon: '📚', max: 30 },
  { action: 'quiz_pass', coins: 60, label: 'Pass a Quiz (75%+)', icon: '🏆', max: 10 },
  { action: 'expense_log', coins: 8, label: 'Log an Expense', icon: '💳', max: 100 },
  { action: 'community_post', coins: 15, label: 'Community Post', icon: '📱', max: 30 },
  { action: 'equipment_list', coins: 30, label: 'List Equipment', icon: '🚜', max: 5 },
  { action: 'weather_check', coins: 3, label: 'Check Weather', icon: '🌤️', max: 60 },
];

export const SPEND_RULES = [
  { action: 'soil_report_discount', coins: 120, label: 'Soil Lab Discount Coupon', icon: '🧪', max: 4 },
  { action: 'transport_cashback', coins: 180, label: 'Transport Cashback', icon: '🚛', max: 6 },
  { action: 'input_store_voucher', coins: 250, label: 'Input Store Voucher', icon: '🏪', max: 5 },
  { action: 'insurance_cashback', coins: 300, label: 'Insurance Premium Cashback', icon: '🛡️', max: 3 },
  { action: 'premium_trial', coins: 500, label: 'Premium Trial Unlock', icon: '💎', max: 2 },
];

export function getCoins() { return load().coins || 0; }
export function addCoins(amount, reason) {
  const d = load();
  d.coins = (d.coins || 0) + amount;
  d.coinLog = d.coinLog || [];
  d.coinLog.unshift({ amount, reason, date: new Date().toISOString() });
  if (d.coinLog.length > 200) d.coinLog = d.coinLog.slice(0, 200);
  save(d);
  return d.coins;
}
export function spendCoins(amount, reason) {
  const d = load();
  if ((d.coins || 0) < amount) return false;
  d.coins -= amount;
  d.coinLog = d.coinLog || [];
  d.coinLog.unshift({ amount: -amount, reason, date: new Date().toISOString() });
  save(d);
  return d.coins;
}
export function getCoinLog() { return load().coinLog || []; }
export function getGamificationSnapshot() {
  const d = load();
  return {
    coins: d.coins || 0,
    streak: d.currentStreak || 0,
    longestStreak: d.longestStreak || 0,
  };
}

/** 12I.2 — Login Streaks */
export function recordLogin() {
  const d = load();
  const today = new Date().toISOString().slice(0, 10);
  if (d.lastLogin === today) return getStreakInfo();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  d.currentStreak = d.lastLogin === yesterday ? (d.currentStreak || 0) + 1 : 1;
  d.longestStreak = Math.max(d.longestStreak || 0, d.currentStreak);
  d.totalLogins = (d.totalLogins || 0) + 1;
  d.lastLogin = today;
  // Streak milestones: bonus coins
  const milestones = { 7: 50, 14: 120, 30: 300, 60: 700, 100: 1500 };
  if (milestones[d.currentStreak]) {
    d.coins = (d.coins || 0) + milestones[d.currentStreak];
    d.coinLog = d.coinLog || [];
    d.coinLog.unshift({ amount: milestones[d.currentStreak], reason: `🔥 ${d.currentStreak}-day streak bonus!`, date: new Date().toISOString() });
  } else {
    d.coins = (d.coins || 0) + 5;
    d.coinLog = d.coinLog || [];
    d.coinLog.unshift({ amount: 5, reason: 'Daily login', date: new Date().toISOString() });
  }
  // Streak insurance: 1 free miss after 14-day streak
  d.streakInsurance = d.currentStreak >= 14 ? 1 : 0;
  save(d);
  return getStreakInfo();
}
export function getStreakInfo() {
  const d = load();
  return {
    currentStreak: d.currentStreak || 0,
    longestStreak: d.longestStreak || 0,
    totalLogins: d.totalLogins || 0,
    lastLogin: d.lastLogin || null,
    streakInsurance: d.streakInsurance || 0,
    milestones: [
      { days: 7, reward: 50, reached: (d.currentStreak || 0) >= 7 },
      { days: 14, reward: 120, reached: (d.currentStreak || 0) >= 14 },
      { days: 30, reward: 300, reached: (d.currentStreak || 0) >= 30 },
      { days: 60, reward: 700, reached: (d.currentStreak || 0) >= 60 },
      { days: 100, reward: 1500, reached: (d.currentStreak || 0) >= 100 },
    ],
  };
}

/** 12I.3 — Badge Engine (30 badges) */
export const BADGES = [
  { id: 'first_login', name: 'First Steps', icon: '👣', desc: 'Log in for the first time', rarity: 'Common', category: 'Engagement' },
  { id: 'profile_done', name: 'Identity Verified', icon: '✅', desc: 'Complete your profile', rarity: 'Common', category: 'Profile' },
  { id: 'streak_7', name: 'Week Warrior', icon: '🔥', desc: '7-day login streak', rarity: 'Uncommon', category: 'Streak' },
  { id: 'streak_30', name: 'Monthly Master', icon: '🌟', desc: '30-day login streak', rarity: 'Rare', category: 'Streak' },
  { id: 'streak_100', name: 'Century Champion', icon: '💎', desc: '100-day streak', rarity: 'Legendary', category: 'Streak' },
  { id: 'first_sale', name: 'Market Debut', icon: '🧾', desc: 'Record first sale', rarity: 'Common', category: 'Commerce' },
  { id: 'sales_10', name: 'Trader Pro', icon: '📈', desc: '10 sales recorded', rarity: 'Uncommon', category: 'Commerce' },
  { id: 'revenue_1l', name: 'Lakhpati', icon: '💰', desc: '₹1L+ total revenue', rarity: 'Rare', category: 'Commerce' },
  { id: 'soil_hero', name: 'Soil Scientist', icon: '🧪', desc: '3 soil tests uploaded', rarity: 'Uncommon', category: 'Knowledge' },
  { id: 'crop_tracker', name: 'Crop Guru', icon: '🌾', desc: 'Track 5+ crops', rarity: 'Uncommon', category: 'Farming' },
  { id: 'weather_watcher', name: 'Weather Watcher', icon: '🌤️', desc: 'Check weather 30 times', rarity: 'Common', category: 'Engagement' },
  { id: 'ai_explorer', name: 'AI Explorer', icon: '🤖', desc: 'Use AI advisory 10 times', rarity: 'Uncommon', category: 'Technology' },
  { id: 'insurance_smart', name: 'Risk Manager', icon: '🛡️', desc: 'Enroll in crop insurance', rarity: 'Uncommon', category: 'Finance' },
  { id: 'kcc_ready', name: 'Credit Ready', icon: '🏦', desc: 'Complete KCC application', rarity: 'Rare', category: 'Finance' },
  { id: 'scholar', name: 'Agri Scholar', icon: '📚', desc: 'Watch 8 learning videos', rarity: 'Uncommon', category: 'Knowledge' },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🏆', desc: 'Score 100% on any quiz', rarity: 'Rare', category: 'Knowledge' },
  { id: 'referral_1', name: 'Community Builder', icon: '👨‍🌾', desc: 'Refer 1 farmer', rarity: 'Common', category: 'Social' },
  { id: 'referral_10', name: 'Village Champion', icon: '🏘️', desc: 'Refer 10 farmers', rarity: 'Rare', category: 'Social' },
  { id: 'referral_50', name: 'District Ambassador', icon: '🌍', desc: 'Refer 50 farmers', rarity: 'Legendary', category: 'Social' },
  { id: 'expense_tracker', name: 'Money Manager', icon: '💳', desc: 'Log 20 expenses', rarity: 'Uncommon', category: 'Finance' },
  { id: 'equipment_owner', name: 'Mechanized Farmer', icon: '🚜', desc: 'List 3 equipment items', rarity: 'Uncommon', category: 'Farming' },
  { id: 'network_star', name: 'Network Star', icon: '🤝', desc: '10 community connections', rarity: 'Uncommon', category: 'Social' },
  { id: 'premium_member', name: 'Premium Pioneer', icon: '💎', desc: 'Subscribe to Premium', rarity: 'Rare', category: 'Engagement' },
  { id: 'coins_1000', name: 'Coin Collector', icon: '🪙', desc: 'Earn 1,000 coins', rarity: 'Uncommon', category: 'Engagement' },
  { id: 'coins_5000', name: 'Treasure Hunter', icon: '💎', desc: 'Earn 5,000 coins', rarity: 'Rare', category: 'Engagement' },
  { id: 'transport_user', name: 'Logistics Pro', icon: '🚛', desc: 'Book 5 transports', rarity: 'Uncommon', category: 'Commerce' },
  { id: 'fpo_member', name: 'FPO Warrior', icon: '🏢', desc: 'Join an FPO', rarity: 'Rare', category: 'Social' },
  { id: 'dispute_resolver', name: 'Peacekeeper', icon: '⚖️', desc: 'Resolve a dispute', rarity: 'Rare', category: 'Social' },
  { id: 'drone_adopter', name: 'Sky Farmer', icon: '🛸', desc: 'Use drone service', rarity: 'Rare', category: 'Technology' },
  { id: 'all_rounder', name: 'All-Rounder', icon: '🏅', desc: 'Earn 20+ badges', rarity: 'Legendary', category: 'Engagement' },
];

export function getEarnedBadges() { return load().earnedBadges || []; }
export function earnBadge(badgeId) {
  const d = load();
  d.earnedBadges = d.earnedBadges || [];
  if (d.earnedBadges.includes(badgeId)) return false;
  d.earnedBadges.push(badgeId);
  const badge = BADGES.find(b => b.id === badgeId);
  const bonusCoins = { Common: 25, Uncommon: 75, Rare: 200, Legendary: 500 }[badge?.rarity] || 25;
  d.coins = (d.coins || 0) + bonusCoins;
  d.coinLog = d.coinLog || [];
  d.coinLog.unshift({ amount: bonusCoins, reason: `🏅 Badge: ${badge?.name}`, date: new Date().toISOString() });
  save(d);
  return true;
}

/** 12I.4 — Leaderboards (demo data) */
export const GEO_TIERS = ['Village', 'Mandal', 'District', 'State', 'National'];
export const LB_CATEGORIES = ['Coins', 'Streak', 'Sales', 'Referrals', 'Badges', 'Learning'];
export const TIME_PERIODS = ['Today', 'This Week', 'This Month', 'All Time'];

export function getLeaderboard(category = 'Coins', geoTier = 'District', period = 'This Month') {
  const names = ['Ravi Kumar', 'Lakshmi Devi', 'Suresh Reddy', 'Anitha Bai', 'Venkat Rao', 'Padma Kumari', 'Krishna Murthy', 'Savitri Devi', 'Ramesh Naik', 'Sita Mahalakshmi'];
  const villages = ['Anantapur', 'Kurnool', 'Guntur', 'Prakasam', 'Krishna', 'Nellore', 'Chittoor', 'Kadapa', 'Vizag', 'Srikakulam'];
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    village: villages[i],
    avatar: name.charAt(0),
    score: Math.max(50, Math.round(5000 / (i + 1) * (Math.random() * 0.3 + 0.85))),
    isCurrentUser: i === 3,
  }));
}

/** 12I.5 — Challenges */
export function getChallenges() {
  return {
    daily: [
      { id: 'd1', title: 'Morning Check-in', desc: 'Log in before 9 AM', reward: 15, icon: '🌅', progress: 1, target: 1 },
      { id: 'd2', title: 'Price Scout', desc: 'Check 3 commodity prices', reward: 10, icon: '💰', progress: 1, target: 3 },
      { id: 'd3', title: 'Weather Wise', desc: 'Check today\'s forecast', reward: 5, icon: '🌤️', progress: 0, target: 1 },
    ],
    weekly: [
      { id: 'w1', title: 'Knowledge Seeker', desc: 'Watch 3 learning videos', reward: 50, icon: '📚', progress: 1, target: 3 },
      { id: 'w2', title: 'Expense Tracker', desc: 'Log 5 expenses this week', reward: 40, icon: '💳', progress: 2, target: 5 },
      { id: 'w3', title: 'Social Butterfly', desc: 'Make 2 community posts', reward: 35, icon: '📱', progress: 0, target: 2 },
    ],
    seasonal: [
      { id: 's1', title: 'Kharif Champion', desc: 'Complete all Kharif crop updates', reward: 500, icon: '🌾', progress: 3, target: 10 },
      { id: 's2', title: 'Insurance Hero', desc: 'Enroll in PMFBY before deadline', reward: 300, icon: '🛡️', progress: 0, target: 1 },
    ],
  };
}

/** 12I.6 — Seasonal Contests */
export function getContests() {
  return [
    { id: 'c1', title: 'Best Kharif Yield 2026', status: 'active', icon: '🏆', participants: 1240, endDate: '2026-11-30', prizes: ['₹10,000', '₹5,000', '₹2,500'], category: 'Yield', votingOpen: true },
    { id: 'c2', title: 'Organic Farming Star', status: 'active', icon: '🌿', participants: 890, endDate: '2026-09-15', prizes: ['₹7,500', '₹3,000', '₹1,500'], category: 'Organic', votingOpen: false },
    { id: 'c3', title: 'Best Farm Photo 2026', status: 'upcoming', icon: '📸', participants: 0, endDate: '2026-12-31', prizes: ['₹5,000', '₹2,000', '₹1,000'], category: 'Creative', votingOpen: false },
    { id: 'c4', title: 'Rabi Record Breaker 2025', status: 'completed', icon: '🥇', participants: 2100, endDate: '2025-04-30', prizes: ['₹10,000', '₹5,000', '₹2,500'], category: 'Yield', votingOpen: false, winners: ['Suresh Reddy', 'Lakshmi Devi', 'Krishna Murthy'] },
  ];
}

/** 12I.7 — Referrals */
export function getReferralInfo() {
  const d = load();
  if (!d.referralCode) {
    d.referralCode = 'AGRI' + Math.random().toString(36).slice(2, 8).toUpperCase();
    save(d);
  }
  return {
    code: d.referralCode,
    totalReferred: d.totalReferred || 3,
    pendingRewards: d.pendingRewards || 1,
    totalEarned: d.referralEarned || 600,
    referrals: [
      { name: 'Ramu', date: '2026-03-10', status: 'active', reward: 200 },
      { name: 'Sita', date: '2026-03-22', status: 'active', reward: 200 },
      { name: 'Venkat', date: '2026-04-05', status: 'active', reward: 200 },
      { name: 'Padma', date: '2026-04-18', status: 'pending', reward: 200 },
    ],
  };
}

export default {
  COIN_RULES, SPEND_RULES, getCoins, addCoins, spendCoins, getCoinLog, getGamificationSnapshot,
  recordLogin, getStreakInfo,
  BADGES, getEarnedBadges, earnBadge,
  GEO_TIERS, LB_CATEGORIES, TIME_PERIODS, getLeaderboard,
  getChallenges, getContests, getReferralInfo, GAMIFICATION_EVENT,
};
