-- ============================================================================
-- AgriConnect 360 — Schema V3: Complete Data Migration Tables
-- Covers: Transport, Suppliers, Sales, Soil/Irrigation, Schemes, Expenses,
--         Wallet, Profile, Quality Lab, Village Explorer
-- ============================================================================

-- ─── Transport Drivers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transport_drivers (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  vehicle     TEXT,
  type        TEXT DEFAULT 'Mini Truck',
  capacity    TEXT,
  rate        NUMERIC DEFAULT 0,
  rating      NUMERIC(3,1) DEFAULT 4.0,
  trips       INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'available',
  location    TEXT,
  district    TEXT DEFAULT 'Guntur',
  photo_url   TEXT,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transport_drivers_read" ON public.transport_drivers FOR SELECT USING (true);
CREATE POLICY "transport_drivers_write" ON public.transport_drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Supplier Shops ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_shops (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'Seeds & Fertilizers',
  location    TEXT,
  district    TEXT DEFAULT 'Guntur',
  phone       TEXT,
  rating      NUMERIC(3,1) DEFAULT 4.0,
  total_reviews INTEGER DEFAULT 0,
  delivery    BOOLEAN DEFAULT false,
  delivery_radius TEXT,
  operating_hours TEXT,
  products    JSONB DEFAULT '[]'::jsonb,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.supplier_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplier_shops_read" ON public.supplier_shops FOR SELECT USING (true);
CREATE POLICY "supplier_shops_write" ON public.supplier_shops FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Supplier Reviews ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_reviews (
  id          BIGSERIAL PRIMARY KEY,
  shop_id     BIGINT REFERENCES public.supplier_shops(id) ON DELETE CASCADE,
  reviewer    TEXT,
  rating      NUMERIC(3,1) DEFAULT 5.0,
  comment     TEXT,
  date        DATE DEFAULT CURRENT_DATE,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.supplier_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplier_reviews_read" ON public.supplier_reviews FOR SELECT USING (true);
CREATE POLICY "supplier_reviews_write" ON public.supplier_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── DBT Transactions (Scheme Payments) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dbt_transactions (
  id          BIGSERIAL PRIMARY KEY,
  scheme      TEXT NOT NULL,
  installment TEXT,
  amount      NUMERIC DEFAULT 0,
  status      TEXT DEFAULT 'pending',
  date        DATE,
  account     TEXT,
  txn_id      TEXT,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.dbt_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dbt_transactions_read" ON public.dbt_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dbt_transactions_write" ON public.dbt_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Monthly Revenue/Expenses (for Sales P&L charts) ───────────────────────
CREATE TABLE IF NOT EXISTS public.monthly_revenue (
  id          BIGSERIAL PRIMARY KEY,
  month       TEXT NOT NULL,
  revenue     NUMERIC DEFAULT 0,
  expenses    NUMERIC DEFAULT 0,
  season      TEXT DEFAULT 'Kharif',
  year        TEXT DEFAULT '2025-26',
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.monthly_revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "monthly_revenue_read" ON public.monthly_revenue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "monthly_revenue_write" ON public.monthly_revenue FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Irrigation Schedules ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.irrigation_schedules (
  id          BIGSERIAL PRIMARY KEY,
  field       TEXT NOT NULL,
  crop        TEXT,
  method      TEXT DEFAULT 'Drip',
  frequency   TEXT DEFAULT 'Every 3 days',
  duration    TEXT DEFAULT '45 min',
  next_run    TIMESTAMPTZ,
  status      TEXT DEFAULT 'scheduled',
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.irrigation_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "irrigation_schedules_read" ON public.irrigation_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "irrigation_schedules_write" ON public.irrigation_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Irrigation Logs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
  id          BIGSERIAL PRIMARY KEY,
  field       TEXT NOT NULL,
  date        DATE DEFAULT CURRENT_DATE,
  method      TEXT DEFAULT 'Drip',
  duration    TEXT,
  water_used  TEXT,
  status      TEXT DEFAULT 'completed',
  notes       TEXT,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "irrigation_logs_read" ON public.irrigation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "irrigation_logs_write" ON public.irrigation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── NDVI Readings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ndvi_readings (
  id          BIGSERIAL PRIMARY KEY,
  field       TEXT,
  date        TEXT NOT NULL,
  value       NUMERIC(4,2) DEFAULT 0.0,
  health      TEXT DEFAULT 'Good',
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ndvi_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ndvi_readings_read" ON public.ndvi_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ndvi_readings_write" ON public.ndvi_readings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Village People (Network) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.village_people (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT 'farmer',
  phone       TEXT,
  district    TEXT DEFAULT 'Guntur',
  village     TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 0,
  rating      NUMERIC(3,1) DEFAULT 4.0,
  available   BOOLEAN DEFAULT true,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.village_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "village_people_read" ON public.village_people FOR SELECT USING (true);
CREATE POLICY "village_people_write" ON public.village_people FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Budget Tracking ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_tracking (
  id          BIGSERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  budget      NUMERIC DEFAULT 0,
  spent       NUMERIC DEFAULT 0,
  season      TEXT DEFAULT 'Kharif 2024-25',
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.budget_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budget_tracking_read" ON public.budget_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budget_tracking_write" ON public.budget_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Wallet Rewards (redeemable items) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallet_rewards (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  cost        INTEGER DEFAULT 0,
  icon        TEXT DEFAULT '🎁',
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.wallet_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_rewards_read" ON public.wallet_rewards FOR SELECT USING (true);

-- ─── Profile Badges ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          BIGSERIAL PRIMARY KEY,
  badge_id    TEXT NOT NULL,
  icon        TEXT,
  label       TEXT NOT NULL,
  description TEXT,
  earned      BOOLEAN DEFAULT false,
  earned_at   TIMESTAMPTZ,
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_read" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_write" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Profile Timeline Events ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id          BIGSERIAL PRIMARY KEY,
  date        DATE DEFAULT CURRENT_DATE,
  icon        TEXT DEFAULT '📋',
  title       TEXT NOT NULL,
  type        TEXT DEFAULT 'milestone',
  user_id     UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline_events_read" ON public.timeline_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timeline_events_write" ON public.timeline_events FOR INSERT WITH CHECK (auth.uid() = user_id);
