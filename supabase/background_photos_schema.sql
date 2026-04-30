-- Background Photos Community System
CREATE TABLE IF NOT EXISTS background_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  uploader_role TEXT NOT NULL CHECK (uploader_role IN ('farmer','supplier','factory','labour','broker')),
  uploader_name TEXT NOT NULL,
  uploader_district TEXT NOT NULL,
  uploader_village TEXT,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  category TEXT CHECK (category IN ('farm_field','crop_harvest','machinery','produce','promotion','labour_work','factory_product','community','livestock','irrigation')),
  display_type TEXT DEFAULT 'local' CHECK (display_type IN ('local','district','statewide','promotion')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','featured')),
  admin_note TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  is_promotion BOOLEAN DEFAULT FALSE,
  promotion_priority INTEGER DEFAULT 0,
  promotion_expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  visible_to_roles TEXT[] DEFAULT ARRAY['farmer','supplier','factory','labour','broker'],
  tags TEXT[],
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photo_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES background_photos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT CHECK (reaction IN ('like','helpful','inspiring')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

ALTER TABLE background_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_approved" ON background_photos FOR SELECT USING (status IN ('approved','featured'));
CREATE POLICY "insert_own" ON background_photos FOR INSERT WITH CHECK (uploader_id = auth.uid());
CREATE POLICY "update_own_pending" ON background_photos FOR UPDATE USING (uploader_id = auth.uid() AND status = 'pending');
CREATE POLICY "admin_all" ON background_photos FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "react_auth" ON photo_reactions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_bp_district ON background_photos(uploader_district);
CREATE INDEX IF NOT EXISTS idx_bp_status ON background_photos(status);
CREATE INDEX IF NOT EXISTS idx_bp_role ON background_photos(uploader_role);
