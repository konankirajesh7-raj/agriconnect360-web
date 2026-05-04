-- ═══════════════════════════════════════════════════════════════
-- AgriConnect 360 — Database Migration: T&M + Payments
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Transport & Machinery Table
CREATE TABLE IF NOT EXISTS transport_machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_role TEXT,
  category TEXT NOT NULL CHECK (category IN ('transport', 'machinery')),
  item_type TEXT NOT NULL,
  name TEXT NOT NULL,
  registration_number TEXT,
  description TEXT,
  rate_per_day NUMERIC,
  rate_unit TEXT DEFAULT 'day',
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'maintenance', 'rented', 'unavailable')),
  capacity TEXT,
  fuel_type TEXT,
  condition TEXT DEFAULT 'good',
  photos TEXT[] DEFAULT '{}',
  activity_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for T&M
ALTER TABLE transport_machinery ENABLE ROW LEVEL SECURITY;

-- Users can only see their own items
CREATE POLICY "Users read own transport_machinery" ON transport_machinery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own transport_machinery" ON transport_machinery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own transport_machinery" ON transport_machinery
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own transport_machinery" ON transport_machinery
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can see all
CREATE POLICY "Admin reads all transport_machinery" ON transport_machinery
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Subscription Payments Table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_role TEXT,
  user_email TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  txn_id TEXT NOT NULL,
  payment_method TEXT DEFAULT 'upi',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'refunded')),
  admin_note TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Payments
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users see their own payments
CREATE POLICY "Users read own payments" ON subscription_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own payments" ON subscription_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin sees all payments and can update
CREATE POLICY "Admin reads all payments" ON subscription_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin updates payments" ON subscription_payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_tm_user_id ON transport_machinery(user_id);
CREATE INDEX IF NOT EXISTS idx_tm_category ON transport_machinery(category);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON subscription_payments(status);

-- 4. Updated_at trigger for T&M
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_tm_updated_at
  BEFORE UPDATE ON transport_machinery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
