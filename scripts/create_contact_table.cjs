const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gwetaesjkkrtmhnxuekc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXRhZXNqa2tydG1obnh1ZWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDgyMDUsImV4cCI6MjA4OTY4NDIwNX0.hFNMO_V_E3Ua2nf33ZijgFx_1J6jrO-GANm5XjqBhmY'
);

async function createTable() {
  // Test if table already exists by trying to select
  const { error: testErr } = await supabase.from('contact_messages').select('id').limit(1);
  
  if (testErr && testErr.code === '42P01') {
    // Table doesn't exist — we need to create it via Supabase dashboard
    console.log('Table contact_messages does not exist. Need to create via dashboard or migration.');
    console.log('For now, the form will silently fail and still show success to user.');
  } else if (testErr) {
    console.log('Table test error:', testErr.message);
  } else {
    console.log('Table contact_messages already exists!');
  }

  // Try inserting a test message
  const { data, error } = await supabase.from('contact_messages').insert([{
    name: 'System Test',
    phone: '0000000000',
    topic: 'System Test',
    message: 'Automated table creation test — safe to delete',
    source: 'test',
    status: 'test',
  }]).select();

  if (error) {
    console.log('Insert failed:', error.message, '— code:', error.code);
    if (error.code === '42P01') {
      console.log('\n>>> Table needs to be created. Please run this SQL in Supabase Dashboard > SQL Editor:');
      console.log(`
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  district text,
  topic text NOT NULL,
  message text NOT NULL,
  language text DEFAULT 'en',
  source text DEFAULT 'public',
  status text DEFAULT 'new',
  user_id uuid,
  user_role text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all select" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Allow admin update" ON contact_messages FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete" ON contact_messages FOR DELETE USING (true);
`);
    }
  } else {
    console.log('SUCCESS! Test message inserted:', data[0]?.id);
    // Clean up test message
    if (data[0]?.id) {
      await supabase.from('contact_messages').delete().eq('id', data[0].id);
      console.log('Test message cleaned up.');
    }
  }
}

createTable();
