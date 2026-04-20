-- ╔══════════════════════════════════════════════════════════════════╗
-- ║        AgriConnect 360 — Supabase Database Schema               ║
-- ║        Default State: Andhra Pradesh                             ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Profiles (extends Supabase auth.users) ────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT UNIQUE,
  role TEXT DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin', 'fpo', 'expert')),
  state TEXT DEFAULT 'Andhra Pradesh',
  district TEXT DEFAULT 'Guntur',
  language TEXT DEFAULT 'te',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Farmers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  mobile TEXT,
  state TEXT DEFAULT 'Andhra Pradesh',
  district TEXT DEFAULT 'Guntur',
  mandal TEXT,
  village TEXT,
  total_land_acres DECIMAL(8,2) DEFAULT 0,
  land_type TEXT DEFAULT 'irrigated',
  annual_income DECIMAL(12,2),
  bank_account TEXT,
  aadhaar TEXT,
  kisan_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Fields ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  area_acres DECIMAL(8,2) NOT NULL,
  soil_type TEXT DEFAULT 'black',
  irrigation_type TEXT DEFAULT 'canal',
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  survey_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Crops ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id),
  crop_type TEXT NOT NULL,
  variety TEXT,
  current_stage TEXT DEFAULT 'planning' CHECK (current_stage IN ('planning','sowing','vegetative','flowering','fruiting','harvesting','harvested')),
  sowing_date DATE,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  area_used_acres DECIMAL(8,2),
  expected_yield_kg DECIMAL(10,2),
  actual_yield_kg DECIMAL(10,2),
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy','stressed','diseased','recovering')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Soil Tests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.soil_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id),
  test_date DATE DEFAULT CURRENT_DATE,
  soil_type TEXT,
  ph_level DECIMAL(4,2),
  nitrogen_level DECIMAL(6,2),
  phosphorus_level DECIMAL(6,2),
  potassium_level DECIMAL(6,2),
  organic_matter DECIMAL(4,2),
  electrical_conductivity DECIMAL(6,3),
  lab_name TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Market Prices ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_type TEXT NOT NULL,
  variety TEXT,
  market_name TEXT NOT NULL,
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'quintal',
  arrivals_tonnes DECIMAL(10,2),
  price_date DATE DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'agmarknet',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Expenses ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id),
  category TEXT NOT NULL CHECK (category IN ('seeds','fertilizers','pesticides','labour','equipment','irrigation','transport','misc')),
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sales ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id),
  crop_type TEXT NOT NULL,
  quantity_sold DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'quintal',
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2),
  buyer_name TEXT,
  buyer_type TEXT DEFAULT 'trader' CHECK (buyer_type IN ('trader','fpo','government','direct','export')),
  market_name TEXT,
  sale_date DATE DEFAULT CURRENT_DATE,
  payment_status TEXT DEFAULT 'received' CHECK (payment_status IN ('pending','partial','received')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Labour Groups ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.labour_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  leader_name TEXT,
  mobile TEXT,
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  total_workers INTEGER DEFAULT 0,
  male_workers INTEGER DEFAULT 0,
  female_workers INTEGER DEFAULT 0,
  specializations TEXT[] DEFAULT '{}',
  daily_rate DECIMAL(8,2),
  rating DECIMAL(3,2) DEFAULT 4.0,
  total_jobs INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Labour Bookings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.labour_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.labour_groups(id),
  work_type TEXT NOT NULL,
  workers_needed INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  total_days INTEGER,
  daily_rate DECIMAL(8,2),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Equipment ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  owner_name TEXT,
  owner_mobile TEXT,
  hourly_rate DECIMAL(8,2),
  daily_rate DECIMAL(8,2),
  per_acre_rate DECIMAL(8,2),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent','good','fair')),
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 4.0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schemes ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subsidy','loan','insurance','training','infrastructure','market','other')),
  state TEXT,
  description TEXT,
  amount DECIMAL(12,2),
  eligibility_criteria JSONB DEFAULT '{}',
  application_url TEXT,
  documents_required TEXT[],
  deadline DATE,
  is_active BOOLEAN DEFAULT true,
  beneficiary_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Knowledge Articles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  reading_time_min INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Weather Alerts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  state TEXT DEFAULT 'Andhra Pradesh',
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rain','drought','heat','cyclone','pest','frost')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  title TEXT NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auction Listings ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auction_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  quantity_quintals DECIMAL(10,2) NOT NULL,
  grade TEXT DEFAULT 'A' CHECK (grade IN ('A+','A','B','C')),
  base_price DECIMAL(10,2) NOT NULL,
  current_bid DECIMAL(10,2),
  location TEXT,
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  auction_end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','expired','cancelled')),
  image_url TEXT,
  bids_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Network Posts (Community Feed) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.network_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','question','tip','disease','market','weather')),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  district TEXT DEFAULT 'Guntur',
  state TEXT DEFAULT 'Andhra Pradesh',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Disputes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('payment','quality','delivery','equipment','labour','other')),
  against_party TEXT,
  description TEXT NOT NULL,
  amount_involved DECIMAL(12,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','resolved','closed')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ── Drone Reports ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.drone_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id),
  report_date DATE DEFAULT CURRENT_DATE,
  area_acres DECIMAL(8,2),
  drone_type TEXT,
  ndvi_score DECIMAL(4,3),
  health_status TEXT,
  stress_zones INTEGER DEFAULT 0,
  recommendations TEXT[],
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────── RLS POLICIES ────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drone_reports ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Public can read market_prices" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Public can read schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Public can read knowledge_articles" ON public.knowledge_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read labour_groups" ON public.labour_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read equipment" ON public.equipment FOR SELECT USING (is_available = true);
CREATE POLICY "Public can read weather_alerts" ON public.weather_alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read auction_listings" ON public.auction_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read network_posts" ON public.network_posts FOR SELECT USING (true);

-- Farmer can manage own data
CREATE POLICY "Farmer can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Farmer can manage own crops" ON public.crops FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own expenses" ON public.expenses FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own sales" ON public.sales FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own soil tests" ON public.soil_tests FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own fields" ON public.fields FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can read all farmers" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Farmer can manage own labour bookings" ON public.labour_bookings FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own auction listings" ON public.auction_listings FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own posts" ON public.network_posts FOR ALL USING (author_id = auth.uid());
CREATE POLICY "Farmer can manage own disputes" ON public.disputes FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));
CREATE POLICY "Farmer can manage own drone reports" ON public.drone_reports FOR ALL USING (farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid()));

-- ── View increment function ───────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS void AS $$
  UPDATE public.knowledge_articles SET view_count = view_count + 1 WHERE id = article_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ── Default AP data seed ──────────────────────────────────────────
INSERT INTO public.schemes (name, category, state, description, amount, eligibility_criteria) VALUES
('YSR Rythu Bharosa', 'subsidy', 'Andhra Pradesh', 'Income support of ₹13,500/year for AP farmers', 13500, '{"land":"Registered farmer in AP","documents":["Aadhaar","Land records"]}'),
('PM-KISAN', 'subsidy', NULL, 'Direct income support ₹6,000/year in 3 installments', 6000, '{"land":"Any size","documents":["Aadhaar","Bank account"]}'),
('PM Fasal Bima Yojana', 'insurance', NULL, 'Crop insurance at subsidized premium rates', 200000, '{"land":"Loanee farmers","documents":["Land records","Bank passbook"]}'),
('Kisan Credit Card', 'loan', NULL, 'Short-term credit up to ₹3 lakh at 4% interest', 300000, '{"age":"18-75","documents":["Land records","Identity proof"]}'),
('YSR Free Crop Insurance', 'insurance', 'Andhra Pradesh', 'Free crop insurance for AP farmers up to 2.5 acres', 50000, '{"land":"Up to 2.5 acres","state":"Andhra Pradesh"}'),
('AP Micro Irrigation', 'infrastructure', 'Andhra Pradesh', 'Subsidy for drip and sprinkler irrigation systems', 150000, '{"land":"Any size","state":"Andhra Pradesh","documents":["Land records"]}'),
('National Horticulture Mission', 'subsidy', NULL, '50% subsidy for horticulture development', 75000, '{"crops":"Horticulture","documents":["Land records","Project report"]}'),
('e-Nam Registration', 'market', NULL, 'Digital market linkage for better prices', 0, '{"documents":["APMC license","Bank account"]}')
ON CONFLICT DO NOTHING;

INSERT INTO public.knowledge_articles (title, category, author, tags, reading_time_min, content) VALUES
('Paddy Cultivation Guide for AP', 'Crop Guide', 'Dr. Ramesh Kumar', ARRAY['paddy','kharif','AP'], 8, 'Complete guide for BPT-5204 and MTU-7029 varieties grown in Andhra Pradesh...'),
('Cotton Farming in AP — Guntur District', 'Crop Guide', 'Dr. Lakshmi Devi', ARRAY['cotton','guntur','AP'], 10, 'Cotton is the main cash crop of Guntur. Plant in June-July...'),
('Chilli Cultivation in Guntur', 'Crop Guide', 'AgriConnect Team', ARRAY['chilli','guntur','spice'], 7, 'Guntur chilli varieties and cultivation practices...'),
('Managing Blast Disease in Paddy', 'Pest & Disease', 'Dr. Venkat Rao', ARRAY['paddy','blast','disease'], 5, 'Brown leaf blast symptoms and treatment...'),
('Drip Irrigation Benefits in AP', 'Irrigation', 'CADA AP', ARRAY['irrigation','drip','water'], 6, 'AP has highest drip irrigation adoption in India...'),
('YSR Rythu Bharosa — How to Apply', 'Government Schemes', 'AgriConnect Team', ARRAY['scheme','AP','subsidy'], 4, 'Step-by-step guide to apply for YSR Rythu Bharosa...')
ON CONFLICT DO NOTHING;

-- Insert AP districts for market prices reference
INSERT INTO public.market_prices (crop_type, market_name, district, state, modal_price, min_price, max_price, arrivals_tonnes) VALUES
('Paddy', 'Guntur APMC', 'Guntur', 'Andhra Pradesh', 2200, 2100, 2300, 450.5),
('Cotton', 'Guntur Cotton Market', 'Guntur', 'Andhra Pradesh', 7200, 7000, 7500, 320.8),
('Chilli', 'Guntur Mirchi Yard', 'Guntur', 'Andhra Pradesh', 18500, 17000, 20000, 85.2),
('Maize', 'Kurnool APMC', 'Kurnool', 'Andhra Pradesh', 1950, 1850, 2100, 680.0),
('Groundnut', 'Kurnool Groundnut Market', 'Kurnool', 'Andhra Pradesh', 5800, 5600, 6000, 210.3),
('Tobacco', 'Ongole Tobacco Market', 'Prakasam', 'Andhra Pradesh', 12500, 12000, 13500, 95.7),
('Tomato', 'Madanapalle APMC', 'Chittoor', 'Andhra Pradesh', 1800, 1500, 2200, 156.4),
('Onion', 'Kurnool APMC', 'Kurnool', 'Andhra Pradesh', 2200, 2000, 2500, 89.1)
ON CONFLICT DO NOTHING;

INSERT INTO public.labour_groups (name, leader_name, mobile, district, state, total_workers, specializations, daily_rate, rating, is_verified) VALUES
('Krishna Kisan Sangha', 'Ranga Rao', '9848012345', 'Guntur', 'Andhra Pradesh', 45, ARRAY['paddy_harvesting','transplanting','weeding'], 400, 4.8, true),
('Andhra Farm Workers', 'Lakshmi Bai', '9848023456', 'Krishna', 'Andhra Pradesh', 32, ARRAY['cotton_picking','chilli_harvesting','spraying'], 450, 4.6, true),
('Guntur Labour Group', 'Suresh Kumar', '9848034567', 'Guntur', 'Andhra Pradesh', 28, ARRAY['land_prep','sowing','fertilizer_application'], 380, 4.3, false),
('Vijayawada Farm Team', 'Nageswara Rao', '9848045678', 'Krishna', 'Andhra Pradesh', 55, ARRAY['tractor_plowing','harvesting','threshing'], 500, 4.9, true)
ON CONFLICT DO NOTHING;
