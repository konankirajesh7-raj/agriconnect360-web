-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  AgriConnect 360 — Phase 8 Schema Additions (v2)               ║
-- ║  Missing tables + indexes + storage                            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Notifications ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weather','price','scheme','crop','system','alert')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Insurance Policies ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  policy_number TEXT,
  crop_type TEXT,
  area_acres DECIMAL(8,2),
  premium_amount DECIMAL(10,2),
  sum_insured DECIMAL(12,2),
  coverage_start DATE,
  coverage_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','claimed','pending')),
  claim_amount DECIMAL(12,2),
  claim_date DATE,
  claim_status TEXT CHECK (claim_status IN ('pending','approved','rejected','paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Wallet Transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit','debit','reward','refund')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2),
  description TEXT,
  reference_id TEXT,
  source TEXT DEFAULT 'system' CHECK (source IN ('system','sale','reward','referral','cashback','manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transport Bookings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transport_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  transporter_name TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'truck',
  origin TEXT NOT NULL,
  origin_district TEXT DEFAULT 'Guntur',
  destination TEXT NOT NULL,
  destination_district TEXT,
  cargo_type TEXT,
  weight_tonnes DECIMAL(8,2),
  distance_km DECIMAL(8,2),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  pickup_date DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_transit','delivered','cancelled')),
  tracking_url TEXT,
  driver_mobile TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Equipment Bookings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id),
  equipment_name TEXT NOT NULL,
  booking_type TEXT DEFAULT 'daily' CHECK (booking_type IN ('hourly','daily','per_acre')),
  start_date DATE NOT NULL,
  end_date DATE,
  hours_used DECIMAL(6,2),
  acres_covered DECIMAL(8,2),
  rate DECIMAL(8,2),
  total_cost DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_use','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Scheme Applications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scheme_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.schemes(id),
  scheme_name TEXT NOT NULL,
  application_number TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft','submitted','under_review','approved','rejected','disbursed')),
  applied_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  amount_applied DECIMAL(12,2),
  amount_approved DECIMAL(12,2),
  documents_submitted TEXT[],
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Farmer Preferences ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.farmer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'te' CHECK (language IN ('te','hi','en','kn','ta')),
  district TEXT DEFAULT 'Guntur',
  preferred_crops TEXT[] DEFAULT '{}',
  notification_weather BOOLEAN DEFAULT true,
  notification_prices BOOLEAN DEFAULT true,
  notification_schemes BOOLEAN DEFAULT true,
  notification_crops BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────── RLS for new tables ──────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Farmer reads own notifications" ON public.notifications FOR SELECT USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Farmer manages own insurance" ON public.insurance_policies FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Farmer reads own wallet" ON public.wallet_transactions FOR SELECT USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Farmer manages own transport" ON public.transport_bookings FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Farmer manages own equipment bookings" ON public.equipment_bookings FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Farmer manages own scheme apps" ON public.scheme_applications FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);
CREATE POLICY "Only admins read audit log" ON public.audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Farmer manages own preferences" ON public.farmer_preferences FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE profile_id = auth.uid())
);

-- ─────────────────── INDEXES ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_farmers_state ON public.farmers(state);
CREATE INDEX IF NOT EXISTS idx_farmers_district ON public.farmers(district);
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON public.farmers(mobile);
CREATE INDEX IF NOT EXISTS idx_fields_farmer_id ON public.fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON public.crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_stage ON public.crops(current_stage);
CREATE INDEX IF NOT EXISTS idx_expenses_farmer_id ON public.expenses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_sales_farmer_id ON public.sales(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON public.market_prices(crop_type);
CREATE INDEX IF NOT EXISTS idx_market_prices_district ON public.market_prices(district);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON public.market_prices(price_date);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer ON public.notifications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_wallet_farmer ON public.wallet_transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transport_farmer ON public.transport_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_farmer ON public.equipment_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_scheme_apps_farmer ON public.scheme_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_labour_bookings_farmer ON public.labour_bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_district ON public.weather_alerts(district);
CREATE INDEX IF NOT EXISTS idx_network_posts_category ON public.network_posts(category);

-- ─────────────────── AUDIT TRIGGER FUNCTION ──────────────────────
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data)
    VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to key tables
CREATE TRIGGER audit_farmers AFTER INSERT OR UPDATE OR DELETE ON public.farmers FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_sales AFTER INSERT OR UPDATE OR DELETE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_wallet AFTER INSERT OR UPDATE OR DELETE ON public.wallet_transactions FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ─────────────────── SEED DATA ───────────────────────────────────
-- Seed notifications
INSERT INTO public.notifications (farmer_id, type, title, message) VALUES
(NULL, 'system', 'Welcome to AgriConnect 360!', 'Start your farming journey with soil testing and AI advisory.'),
(NULL, 'price', 'Cotton price surge in Guntur', 'Cotton modal price crossed ₹7,500/quintal at Guntur APMC today.'),
(NULL, 'weather', 'Heavy rain expected in Coastal AP', 'IMD forecast: Heavy rainfall expected in Krishna, Guntur districts for next 48 hours.'),
(NULL, 'scheme', 'YSR Rythu Bharosa — 3rd installment', 'The 3rd installment of ₹4,000 is being credited to eligible farmer accounts.')
ON CONFLICT DO NOTHING;

-- Seed more market prices for other AP districts
INSERT INTO public.market_prices (crop_type, market_name, district, state, modal_price, min_price, max_price, arrivals_tonnes) VALUES
('Paddy', 'Vijayawada APMC', 'Krishna', 'Andhra Pradesh', 2250, 2150, 2350, 520.0),
('Cotton', 'Adoni Cotton Market', 'Kurnool', 'Andhra Pradesh', 7100, 6900, 7300, 280.5),
('Chilli', 'Nandyal APMC', 'Nandyal', 'Andhra Pradesh', 17800, 16500, 19500, 65.0),
('Turmeric', 'Duggirala Market', 'Guntur', 'Andhra Pradesh', 12500, 11800, 13200, 42.8),
('Mango', 'Vijayawada Fruit Market', 'Krishna', 'Andhra Pradesh', 4500, 3800, 5200, 120.4),
('Sugarcane', 'Tanuku Sugar Mill', 'West Godavari', 'Andhra Pradesh', 3100, 2900, 3300, 850.0),
('Coconut', 'East Godavari APMC', 'East Godavari', 'Andhra Pradesh', 2800, 2600, 3000, 180.3),
('Banana', 'Anantapur APMC', 'Anantapur', 'Andhra Pradesh', 1200, 1000, 1400, 95.6),
('Groundnut', 'Anantapur Groundnut Market', 'Anantapur', 'Andhra Pradesh', 5900, 5700, 6200, 310.5),
('Black Gram', 'Srikakulam APMC', 'Srikakulam', 'Andhra Pradesh', 7800, 7500, 8200, 55.2),
('Green Gram', 'Vizianagaram APMC', 'Vizianagaram', 'Andhra Pradesh', 7200, 6900, 7600, 48.7),
('Jowar', 'Kurnool APMC', 'Kurnool', 'Andhra Pradesh', 2800, 2600, 3000, 125.0)
ON CONFLICT DO NOTHING;

-- Seed additional AP labour groups
INSERT INTO public.labour_groups (name, leader_name, mobile, district, state, total_workers, specializations, daily_rate, rating, is_verified) VALUES
('Prakasam Farm Workers', 'Venkateswara Rao', '9848056789', 'Prakasam', 'Andhra Pradesh', 38, ARRAY['tobacco_harvesting','cotton_picking','land_prep'], 420, 4.5, true),
('East Godavari Kisan Team', 'Satyanarayana', '9848067890', 'East Godavari', 'Andhra Pradesh', 60, ARRAY['paddy_transplanting','coconut_harvesting','spraying'], 380, 4.7, true),
('Anantapur Dry Land Workers', 'Obulamma', '9848078901', 'Anantapur', 'Andhra Pradesh', 25, ARRAY['groundnut_harvesting','weeding','sowing'], 350, 4.2, false),
('Chittoor Horticulture Team', 'Narasimhulu', '9848089012', 'Chittoor', 'Andhra Pradesh', 42, ARRAY['mango_picking','tomato_harvesting','grafting'], 480, 4.8, true)
ON CONFLICT DO NOTHING;

-- Seed equipment for AP
INSERT INTO public.equipment (name, type, brand, model, district, state, owner_name, owner_mobile, hourly_rate, daily_rate, per_acre_rate, condition, is_available, rating) VALUES
('Mahindra 575 DI Tractor', 'tractor', 'Mahindra', '575 DI', 'Guntur', 'Andhra Pradesh', 'Subramaniam', '9848011111', 300, 2500, 1200, 'excellent', true, 4.9),
('John Deere Harvester', 'harvester', 'John Deere', 'W70', 'Krishna', 'Andhra Pradesh', 'Ranga Rao', '9848022222', 800, 6000, 2500, 'good', true, 4.7),
('Power Sprayer 20L', 'sprayer', 'Honda', 'WX20', 'Prakasam', 'Andhra Pradesh', 'Farmer Co-op', '9848033333', 100, 500, 200, 'good', true, 4.3),
('Rotavator 5ft', 'rotavator', 'Shaktiman', 'Heavy Duty', 'Kurnool', 'Andhra Pradesh', 'Veeresham', '9848044444', 250, 1800, 900, 'excellent', true, 4.6),
('Seed Drill Machine', 'seed_drill', 'Fieldking', 'Multi Crop', 'Anantapur', 'Andhra Pradesh', 'FPO Anantapur', '9848055555', 200, 1500, 700, 'fair', true, 4.1),
('DJI Agras T30 Drone', 'drone', 'DJI', 'Agras T30', 'Guntur', 'Andhra Pradesh', 'AgriDrone AP', '9848066666', 1500, 10000, 500, 'excellent', true, 4.9)
ON CONFLICT DO NOTHING;
