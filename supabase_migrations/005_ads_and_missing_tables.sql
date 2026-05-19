-- Ads table for AgriConnect 360 Advertisement System
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  duration_days INTEGER DEFAULT 7,
  reach TEXT DEFAULT 'local' CHECK (reach IN ('local', 'district', 'state')),
  district TEXT,
  location TEXT,
  amount_paid NUMERIC DEFAULT 50,
  role TEXT DEFAULT 'farmer',
  advertiser_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  payment_status TEXT DEFAULT 'paid',
  admin_note TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_district ON ads(district);
CREATE INDEX IF NOT EXISTS idx_ads_reach ON ads(reach);

-- RLS policies
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Users can read approved ads
CREATE POLICY "Anyone can view approved ads" ON ads
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

-- Users can insert their own ads
CREATE POLICY "Users can create ads" ON ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ads
CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can do everything (via service role or matching admin check)
-- For now allow all updates for admin operations
CREATE POLICY "Allow all updates for admin" ON ads
  FOR UPDATE USING (true);

CREATE POLICY "Allow all deletes for admin" ON ads
  FOR DELETE USING (true);

-- Notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'crop',
  read BOOLEAN DEFAULT false,
  snoozed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Farm tasks table (if not exists)
CREATE TABLE IF NOT EXISTS farm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Custom',
  crop TEXT,
  due DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  auto BOOLEAN DEFAULT false,
  recur TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farm_tasks_user ON farm_tasks(user_id);
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks" ON farm_tasks
  FOR ALL USING (auth.uid() = user_id);

-- Farmer preferences (if not exists)
CREATE TABLE IF NOT EXISTS farmer_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weather_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE farmer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences" ON farmer_preferences
  FOR ALL USING (auth.uid() = farmer_id);
