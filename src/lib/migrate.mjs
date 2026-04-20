/**
 * Phase 8A — Database Migration Script
 * Runs SQL statements against Supabase using the existing JS client.
 * Usage: node src/lib/migrate.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwetaesjkkrtmhnxuekc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2UiLCJyZWYiOiJnd2V0YWVzamtrcnRtaG54dWVrYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc0MTA4MjA1LCJleHAiOjIwODk2ODQyMDV9.hFNMO_V_E3Ua2nf33ZijgFx_1j6jrO-GANm5XjqBhmY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Seed AP Market Prices ─────────────────────────────────────────
const MARKET_PRICES = [
  { crop_type: 'Paddy', market_name: 'Guntur APMC', district: 'Guntur', state: 'Andhra Pradesh', modal_price: 2200, min_price: 2100, max_price: 2300, arrivals_tonnes: 450.5 },
  { crop_type: 'Cotton', market_name: 'Guntur Cotton Market', district: 'Guntur', state: 'Andhra Pradesh', modal_price: 7200, min_price: 7000, max_price: 7500, arrivals_tonnes: 320.8 },
  { crop_type: 'Chilli', market_name: 'Guntur Mirchi Yard', district: 'Guntur', state: 'Andhra Pradesh', modal_price: 18500, min_price: 17000, max_price: 20000, arrivals_tonnes: 85.2 },
  { crop_type: 'Maize', market_name: 'Kurnool APMC', district: 'Kurnool', state: 'Andhra Pradesh', modal_price: 1950, min_price: 1850, max_price: 2100, arrivals_tonnes: 680.0 },
  { crop_type: 'Groundnut', market_name: 'Kurnool Groundnut Market', district: 'Kurnool', state: 'Andhra Pradesh', modal_price: 5800, min_price: 5600, max_price: 6000, arrivals_tonnes: 210.3 },
  { crop_type: 'Tobacco', market_name: 'Ongole Tobacco Market', district: 'Prakasam', state: 'Andhra Pradesh', modal_price: 12500, min_price: 12000, max_price: 13500, arrivals_tonnes: 95.7 },
  { crop_type: 'Tomato', market_name: 'Madanapalle APMC', district: 'Chittoor', state: 'Andhra Pradesh', modal_price: 1800, min_price: 1500, max_price: 2200, arrivals_tonnes: 156.4 },
  { crop_type: 'Onion', market_name: 'Kurnool APMC', district: 'Kurnool', state: 'Andhra Pradesh', modal_price: 2200, min_price: 2000, max_price: 2500, arrivals_tonnes: 89.1 },
  { crop_type: 'Paddy', market_name: 'Vijayawada APMC', district: 'Krishna', state: 'Andhra Pradesh', modal_price: 2250, min_price: 2150, max_price: 2350, arrivals_tonnes: 520.0 },
  { crop_type: 'Cotton', market_name: 'Adoni Cotton Market', district: 'Kurnool', state: 'Andhra Pradesh', modal_price: 7100, min_price: 6900, max_price: 7300, arrivals_tonnes: 280.5 },
  { crop_type: 'Turmeric', market_name: 'Duggirala Market', district: 'Guntur', state: 'Andhra Pradesh', modal_price: 12500, min_price: 11800, max_price: 13200, arrivals_tonnes: 42.8 },
  { crop_type: 'Sugarcane', market_name: 'Tanuku Sugar Mill', district: 'West Godavari', state: 'Andhra Pradesh', modal_price: 3100, min_price: 2900, max_price: 3300, arrivals_tonnes: 850.0 },
  { crop_type: 'Coconut', market_name: 'East Godavari APMC', district: 'East Godavari', state: 'Andhra Pradesh', modal_price: 2800, min_price: 2600, max_price: 3000, arrivals_tonnes: 180.3 },
  { crop_type: 'Banana', market_name: 'Anantapur APMC', district: 'Anantapur', state: 'Andhra Pradesh', modal_price: 1200, min_price: 1000, max_price: 1400, arrivals_tonnes: 95.6 },
  { crop_type: 'Groundnut', market_name: 'Anantapur Groundnut Market', district: 'Anantapur', state: 'Andhra Pradesh', modal_price: 5900, min_price: 5700, max_price: 6200, arrivals_tonnes: 310.5 },
  { crop_type: 'Black Gram', market_name: 'Srikakulam APMC', district: 'Srikakulam', state: 'Andhra Pradesh', modal_price: 7800, min_price: 7500, max_price: 8200, arrivals_tonnes: 55.2 },
  { crop_type: 'Green Gram', market_name: 'Vizianagaram APMC', district: 'Vizianagaram', state: 'Andhra Pradesh', modal_price: 7200, min_price: 6900, max_price: 7600, arrivals_tonnes: 48.7 },
  { crop_type: 'Jowar', market_name: 'Kurnool APMC', district: 'Kurnool', state: 'Andhra Pradesh', modal_price: 2800, min_price: 2600, max_price: 3000, arrivals_tonnes: 125.0 },
];

// ── Seed AP Farmers ───────────────────────────────────────────────
const FARMERS = [
  { name: 'Ramaiah Gowda', mobile: '9876543210', district: 'Guntur', state: 'Andhra Pradesh', village: 'Tenali', mandal: 'Tenali', total_land_acres: 3.5, is_active: true, is_verified: true },
  { name: 'Lakshmi Devi', mobile: '9988776655', district: 'Krishna', state: 'Andhra Pradesh', village: 'Vijayawada', mandal: 'Vijayawada', total_land_acres: 2.0, is_active: true, is_verified: true },
  { name: 'Venkatesh Reddy', mobile: '9123456789', district: 'Prakasam', state: 'Andhra Pradesh', village: 'Ongole', mandal: 'Ongole', total_land_acres: 4.5, is_active: true, is_verified: false },
  { name: 'Kavitha Rao', mobile: '9654321098', district: 'Kurnool', state: 'Andhra Pradesh', village: 'Nandyal', mandal: 'Nandyal', total_land_acres: 5.0, is_active: true, is_verified: true },
  { name: 'Suresh Naidu', mobile: '9450123456', district: 'Anantapur', state: 'Andhra Pradesh', village: 'Dharmavaram', mandal: 'Dharmavaram', total_land_acres: 2.5, is_active: true, is_verified: false },
  { name: 'Anitha Kumari', mobile: '9321654789', district: 'Chittoor', state: 'Andhra Pradesh', village: 'Madanapalle', mandal: 'Madanapalle', total_land_acres: 3.0, is_active: true, is_verified: true },
  { name: 'Basavaraj Reddy', mobile: '9789012345', district: 'East Godavari', state: 'Andhra Pradesh', village: 'Rajahmundry', mandal: 'Rajahmundry', total_land_acres: 6.0, is_active: true, is_verified: true },
  { name: 'Pushpa Bai', mobile: '9234567890', district: 'West Godavari', state: 'Andhra Pradesh', village: 'Eluru', mandal: 'Eluru', total_land_acres: 1.5, is_active: true, is_verified: false },
  { name: 'Narasimha Rao', mobile: '9845678901', district: 'Visakhapatnam', state: 'Andhra Pradesh', village: 'Anakapalli', mandal: 'Anakapalli', total_land_acres: 4.0, is_active: true, is_verified: true },
  { name: 'Sarada Devi', mobile: '9712345678', district: 'Srikakulam', state: 'Andhra Pradesh', village: 'Palasa', mandal: 'Palasa', total_land_acres: 2.0, is_active: true, is_verified: true },
];

// ── Seed Fields ───────────────────────────────────────────────────
const FIELDS_SEED = [
  { field_name: 'North Plot - Paddy', area_acres: 2.5, soil_type: 'black', irrigation_type: 'canal', survey_number: 'SY-GNT-101' },
  { field_name: 'South Plot - Cotton', area_acres: 1.0, soil_type: 'red', irrigation_type: 'borewell', survey_number: 'SY-GNT-102' },
  { field_name: 'River Side Field', area_acres: 3.0, soil_type: 'alluvial', irrigation_type: 'canal', survey_number: 'SY-KRN-201' },
  { field_name: 'Dry Land - Groundnut', area_acres: 4.5, soil_type: 'sandy', irrigation_type: 'rainfed', survey_number: 'SY-PKM-301' },
  { field_name: 'Irrigated Plot A', area_acres: 5.0, soil_type: 'clay', irrigation_type: 'drip', survey_number: 'SY-KNL-401' },
  { field_name: 'Terrace Farm', area_acres: 2.5, soil_type: 'red', irrigation_type: 'sprinkler', survey_number: 'SY-ATP-501' },
];

// ── Seed Expenses ─────────────────────────────────────────────────
const EXPENSES_SEED = [
  { category: 'seeds', description: 'BPT-5204 Paddy Seeds 50kg', amount: 4500, expense_date: '2025-07-10' },
  { category: 'fertilizers', description: 'Urea 50kg + DAP 25kg', amount: 3800, expense_date: '2025-07-20' },
  { category: 'labour', description: 'Transplanting crew 12 workers', amount: 12000, expense_date: '2025-08-01' },
  { category: 'pesticides', description: 'Imidacloprid 250ml for BPH', amount: 1800, expense_date: '2025-08-15' },
  { category: 'irrigation', description: 'Electricity bill Q3', amount: 3200, expense_date: '2025-09-01' },
  { category: 'transport', description: 'Paddy to Guntur APMC', amount: 5000, expense_date: '2025-12-10' },
  { category: 'equipment', description: 'Tractor rental for plowing', amount: 8500, expense_date: '2025-06-20' },
];

async function seedData(table, data, label) {
  console.log(`\n📦 Seeding ${label}...`);
  const { data: result, error } = await supabase.from(table).upsert(data, { ignoreDuplicates: true }).select();
  if (error) {
    console.log(`   ⚠️  ${label}: ${error.message}`);
    // Try insert if upsert fails
    const { data: r2, error: e2 } = await supabase.from(table).insert(data).select();
    if (e2) {
      console.log(`   ❌ ${label} failed: ${e2.message}`);
      return null;
    }
    console.log(`   ✅ ${label}: ${r2?.length || 0} rows inserted`);
    return r2;
  }
  console.log(`   ✅ ${label}: ${result?.length || 0} rows seeded`);
  return result;
}

async function checkTable(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) return { exists: false, count: 0, error: error.message };
  return { exists: true, count: count || 0 };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  AgriConnect 360 — Phase 8A Database Migration       ║');
  console.log('║  Target: gwetaesjkkrtmhnxuekc.supabase.co            ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  // Step 1: Check which tables already exist
  console.log('\n🔍 Checking existing tables...');
  const tables = ['farmers', 'fields', 'crops', 'expenses', 'sales', 'soil_tests',
    'market_prices', 'labour_groups', 'labour_bookings', 'equipment',
    'schemes', 'knowledge_articles', 'weather_alerts', 'auction_listings',
    'network_posts', 'disputes', 'drone_reports', 'profiles',
    'notifications', 'insurance_policies', 'wallet_transactions',
    'transport_bookings', 'equipment_bookings', 'scheme_applications',
    'audit_log', 'farmer_preferences'];

  for (const t of tables) {
    const info = await checkTable(t);
    const icon = info.exists ? '✅' : '❌';
    const countStr = info.exists ? ` (${info.count} rows)` : ` — ${info.error}`;
    console.log(`   ${icon} ${t}${countStr}`);
  }

  // Step 2: Seed data into existing tables
  console.log('\n' + '═'.repeat(55));
  console.log('📊 SEEDING DATA INTO EXISTING TABLES');
  console.log('═'.repeat(55));

  // Seed market prices
  await seedData('market_prices', MARKET_PRICES, 'AP Market Prices (18 crops × 13 districts)');

  // Seed farmers
  const seededFarmers = await seedData('farmers', FARMERS, 'AP Farmers (10 demo farmers)');

  // Seed fields (linked to first farmer if possible)
  if (seededFarmers?.length) {
    const fieldsWithFarmer = FIELDS_SEED.map((f, i) => ({
      ...f,
      farmer_id: seededFarmers[i % seededFarmers.length].id,
    }));
    await seedData('fields', fieldsWithFarmer, 'Fields (6 fields)');

    // Seed expenses (linked to first farmer)
    const expensesWithFarmer = EXPENSES_SEED.map(e => ({
      ...e,
      farmer_id: seededFarmers[0].id,
    }));
    await seedData('expenses', expensesWithFarmer, 'Expenses (7 records)');
  } else {
    await seedData('fields', FIELDS_SEED, 'Fields (6 fields, no farmer link)');
    await seedData('expenses', EXPENSES_SEED, 'Expenses (7 records, no farmer link)');
  }

  // Step 3: Final counts
  console.log('\n' + '═'.repeat(55));
  console.log('📊 FINAL TABLE COUNTS');
  console.log('═'.repeat(55));

  for (const t of ['farmers', 'fields', 'market_prices', 'expenses', 'schemes', 'knowledge_articles', 'labour_groups', 'equipment']) {
    const info = await checkTable(t);
    if (info.exists) console.log(`   📋 ${t}: ${info.count} rows`);
  }

  console.log('\n✅ Phase 8A — Database seeding complete!');
  console.log('🔗 View at: https://supabase.com/dashboard/project/gwetaesjkkrtmhnxuekc/editor\n');
}

main().catch(console.error);
