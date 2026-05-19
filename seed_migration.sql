-- AgriConnect 360 — New Tables + Seed Data Migration
-- Run in Supabase SQL Editor

-- 1) Marketplace Orders Table
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id UUID,
  crop TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'Quintals',
  price_per_unit NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  buyer_name TEXT,
  buyer_phone TEXT,
  seller_name TEXT,
  delivery_address TEXT,
  district TEXT,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Fields Table
CREATE TABLE IF NOT EXISTS fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Field 1',
  area_acres NUMERIC DEFAULT 1,
  soil_type TEXT DEFAULT 'Black Cotton',
  irrigation_type TEXT DEFAULT 'Borewell',
  district TEXT,
  village TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Crops Table
CREATE TABLE IF NOT EXISTS crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  season TEXT DEFAULT 'Kharif',
  status TEXT DEFAULT 'growing',
  area_acres NUMERIC DEFAULT 1,
  district TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Cold Storage Bookings (if not exists)
CREATE TABLE IF NOT EXISTS cold_storage_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID,
  facility_name TEXT,
  crop TEXT,
  quantity_tons NUMERIC DEFAULT 0,
  from_date DATE,
  to_date DATE,
  estimated_cost NUMERIC DEFAULT 0,
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) AgriTourism Bookings (if not exists)
CREATE TABLE IF NOT EXISTS agritourism_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID,
  guests INTEGER DEFAULT 1,
  booking_date DATE,
  total_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'confirmed',
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_storage_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agritourism_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use IF NOT EXISTS pattern via DO block)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'marketplace_orders_select') THEN
    CREATE POLICY "marketplace_orders_select" ON marketplace_orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'marketplace_orders_insert') THEN
    CREATE POLICY "marketplace_orders_insert" ON marketplace_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fields_user') THEN
    CREATE POLICY "fields_user" ON fields FOR ALL USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'crops_user') THEN
    CREATE POLICY "crops_user" ON crops FOR ALL USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cs_bookings_select') THEN
    CREATE POLICY "cs_bookings_select" ON cold_storage_bookings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cs_bookings_insert') THEN
    CREATE POLICY "cs_bookings_insert" ON cold_storage_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'at_bookings_select') THEN
    CREATE POLICY "at_bookings_select" ON agritourism_bookings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'at_bookings_insert') THEN
    CREATE POLICY "at_bookings_insert" ON agritourism_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6) Seed market_prices with real AP data
INSERT INTO market_prices (crop, district, mandi, price, min_price, max_price, price_date, source) VALUES
  ('Paddy (BPT-5204)', 'Guntur', 'Guntur APMC', 2180, 2050, 2300, '2026-05-10', 'seed'),
  ('Paddy (Sona Masuri)', 'Krishna', 'Vijayawada APMC', 2350, 2200, 2480, '2026-05-10', 'seed'),
  ('Paddy (IR-64)', 'East Godavari', 'Rajahmundry APMC', 1980, 1850, 2100, '2026-05-10', 'seed'),
  ('Paddy (MTU-1010)', 'West Godavari', 'Eluru APMC', 2100, 1950, 2250, '2026-05-10', 'seed'),
  ('Paddy (NLR-34449)', 'Nellore', 'Nellore APMC', 2050, 1900, 2200, '2026-05-09', 'seed'),
  ('Cotton (MCU-5)', 'Kurnool', 'Kurnool APMC', 7200, 6800, 7600, '2026-05-10', 'seed'),
  ('Cotton (Bunny)', 'Guntur', 'Narasaraopet APMC', 7450, 7100, 7800, '2026-05-10', 'seed'),
  ('Cotton (Suraj)', 'Prakasam', 'Ongole APMC', 7100, 6700, 7500, '2026-05-09', 'seed'),
  ('Red Chilli (Teja)', 'Guntur', 'Guntur APMC', 14500, 13000, 16000, '2026-05-10', 'seed'),
  ('Red Chilli (Wonder Hot)', 'Guntur', 'Chilakaluripet APMC', 13800, 12500, 15200, '2026-05-10', 'seed'),
  ('Red Chilli (334)', 'Kurnool', 'Kurnool APMC', 12500, 11000, 14000, '2026-05-09', 'seed'),
  ('Maize (Hybrid)', 'Karimnagar', 'Karimnagar APMC', 2150, 2000, 2300, '2026-05-10', 'seed'),
  ('Maize (Yellow)', 'Guntur', 'Guntur APMC', 2200, 2050, 2350, '2026-05-10', 'seed'),
  ('Groundnut (Bold)', 'Anantapur', 'Anantapur APMC', 5900, 5500, 6300, '2026-05-10', 'seed'),
  ('Groundnut (Java)', 'Kurnool', 'Kurnool APMC', 6200, 5800, 6600, '2026-05-09', 'seed'),
  ('Groundnut (TMV-2)', 'Chittoor', 'Tirupati APMC', 5700, 5300, 6100, '2026-05-09', 'seed'),
  ('Turmeric (Salem)', 'Nizamabad', 'Nizamabad APMC', 9500, 8800, 10200, '2026-05-10', 'seed'),
  ('Turmeric (Erode)', 'Guntur', 'Duggirala APMC', 10200, 9500, 11000, '2026-05-10', 'seed'),
  ('Sugarcane', 'Visakhapatnam', 'Vizag APMC', 3150, 2900, 3400, '2026-05-10', 'seed'),
  ('Sugarcane', 'East Godavari', 'Rajahmundry APMC', 3200, 3000, 3500, '2026-05-09', 'seed'),
  ('Tomato', 'Chittoor', 'Madanapalle APMC', 1800, 1200, 2400, '2026-05-10', 'seed'),
  ('Tomato', 'Kurnool', 'Kurnool APMC', 1500, 900, 2100, '2026-05-10', 'seed'),
  ('Onion', 'Kurnool', 'Kurnool APMC', 2200, 1800, 2600, '2026-05-10', 'seed'),
  ('Onion', 'YSR Kadapa', 'Kadapa APMC', 2000, 1600, 2400, '2026-05-09', 'seed'),
  ('Green Chilli', 'Guntur', 'Guntur APMC', 3500, 2800, 4200, '2026-05-10', 'seed'),
  ('Banana (Robusta)', 'East Godavari', 'Rajahmundry APMC', 1200, 900, 1500, '2026-05-10', 'seed'),
  ('Banana (Grand Naine)', 'Krishna', 'Vijayawada APMC', 1400, 1100, 1700, '2026-05-09', 'seed'),
  ('Mango (Banganapalli)', 'Krishna', 'Vijayawada APMC', 4500, 3500, 5500, '2026-05-10', 'seed'),
  ('Mango (Totapuri)', 'Chittoor', 'Tirupati APMC', 3200, 2500, 4000, '2026-05-10', 'seed'),
  ('Coconut', 'East Godavari', 'Kakinada APMC', 1800, 1500, 2100, '2026-05-10', 'seed'),
  ('Coconut', 'West Godavari', 'Eluru APMC', 1700, 1400, 2000, '2026-05-09', 'seed'),
  ('Black Gram (Urad)', 'Guntur', 'Guntur APMC', 7800, 7200, 8400, '2026-05-10', 'seed'),
  ('Black Gram (Urad)', 'Prakasam', 'Ongole APMC', 7500, 6900, 8100, '2026-05-09', 'seed'),
  ('Green Gram (Moong)', 'Guntur', 'Narasaraopet APMC', 8200, 7600, 8800, '2026-05-10', 'seed'),
  ('Green Gram (Moong)', 'Nellore', 'Nellore APMC', 7900, 7300, 8500, '2026-05-09', 'seed'),
  ('Bengal Gram (Chana)', 'Kurnool', 'Kurnool APMC', 5500, 5000, 6000, '2026-05-10', 'seed'),
  ('Pigeon Pea (Toor Dal)', 'Guntur', 'Guntur APMC', 9200, 8500, 9900, '2026-05-10', 'seed'),
  ('Sunflower', 'Kurnool', 'Kurnool APMC', 6100, 5700, 6500, '2026-05-10', 'seed'),
  ('Castor Seed', 'Anantapur', 'Anantapur APMC', 5800, 5400, 6200, '2026-05-09', 'seed'),
  ('Jowar (Sorghum)', 'Kurnool', 'Kurnool APMC', 3200, 2900, 3500, '2026-05-10', 'seed'),
  ('Bajra (Pearl Millet)', 'Anantapur', 'Anantapur APMC', 2400, 2100, 2700, '2026-05-09', 'seed'),
  ('Sesame (Nuvvulu)', 'Prakasam', 'Ongole APMC', 12500, 11500, 13500, '2026-05-10', 'seed'),
  ('Coriander', 'Guntur', 'Guntur APMC', 8500, 7800, 9200, '2026-05-10', 'seed'),
  ('Curry Leaves', 'Krishna', 'Vijayawada APMC', 4000, 3200, 4800, '2026-05-09', 'seed'),
  ('Drumstick (Moringa)', 'Nellore', 'Nellore APMC', 2800, 2200, 3400, '2026-05-10', 'seed'),
  ('Brinjal', 'Guntur', 'Tenali APMC', 1600, 1100, 2100, '2026-05-10', 'seed'),
  ('Lady Finger (Bhindi)', 'Krishna', 'Vijayawada APMC', 2200, 1700, 2700, '2026-05-10', 'seed'),
  ('Cabbage', 'Chittoor', 'Madanapalle APMC', 1200, 800, 1600, '2026-05-09', 'seed'),
  ('Cauliflower', 'Chittoor', 'Madanapalle APMC', 1800, 1300, 2300, '2026-05-09', 'seed'),
  ('Potato', 'Chittoor', 'Tirupati APMC', 2000, 1600, 2400, '2026-05-10', 'seed')
ON CONFLICT DO NOTHING;

-- 7) Drop removed module tables
DROP TABLE IF EXISTS iot_sensor_data CASCADE;
DROP TABLE IF EXISTS gamification_profiles CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;
DROP TABLE IF EXISTS fpo_data CASCADE;
