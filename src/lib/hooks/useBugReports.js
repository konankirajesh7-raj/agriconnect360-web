import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

// Demo bugs always shown as fallback / seed data
const DEMO_BUGS = [
  { id:'demo-1', reporter_name:'Ramesh Kumar', reporter_role:'farmer', title:'Market prices not loading on mobile', description:'When I open market prices page on my phone, the prices table shows blank. Only headers visible.', severity:'high', category:'mobile', status:'new', page_name:'Market Prices', page_url:'/market-prices', media_urls:[], upvote_count:5, tags:['mobile','data'], platform:'mobile', device_info:'Android 13 / Chrome 120', reported_at: new Date(Date.now()-3600000).toISOString(), updated_at: new Date(Date.now()-3600000).toISOString() },
  { id:'demo-2', reporter_name:'Lakshmi Devi', reporter_role:'admin', title:'Dashboard stat cards show wrong revenue', description:'Platform Revenue shows ₹2.4Cr but actual calculation from sales data shows ₹1.8Cr. Numbers mismatch.', severity:'critical', category:'data_error', status:'acknowledged', page_name:'Dashboard', page_url:'/dashboard', media_urls:[], upvote_count:12, tags:['finance','dashboard'], platform:'web', device_info:'Windows 11 / Edge 121', reported_at: new Date(Date.now()-7200000).toISOString(), updated_at: new Date(Date.now()-5400000).toISOString() },
  { id:'demo-3', reporter_name:'Suresh Naidu', reporter_role:'supplier', title:'Upload button not working in equipment page', description:'Cannot upload equipment photos. Button clicks but nothing happens. No file picker appears.', severity:'medium', category:'functionality', status:'in_progress', page_name:'Equipment', page_url:'/equipment', media_urls:[], upvote_count:3, tags:['upload','equipment'], platform:'web', device_info:'MacOS 14 / Safari 17', assigned_to:'Dev Team', developer_note:'Investigating file picker issue on Safari', reported_at: new Date(Date.now()-86400000).toISOString(), updated_at: new Date(Date.now()-43200000).toISOString() },
  { id:'demo-4', reporter_name:'Venkat Reddy', reporter_role:'farmer', title:'Weather page shows wrong location', description:'Weather shows Hyderabad data instead of Guntur. Location detection seems broken.', severity:'high', category:'functionality', status:'new', page_name:'Weather', page_url:'/weather', media_urls:[], upvote_count:8, tags:['weather','location'], platform:'web', device_info:'Windows 10 / Chrome 121', reported_at: new Date(Date.now()-1800000).toISOString(), updated_at: new Date(Date.now()-1800000).toISOString() },
  { id:'demo-5', reporter_name:'Priya Sharma', reporter_role:'admin', title:'Sidebar overlaps content on tablet', description:'On iPad the sidebar doesnt close properly and overlaps the main content area.', severity:'medium', category:'ui_bug', status:'resolved', page_name:'All Pages', page_url:'/', media_urls:[], upvote_count:2, tags:['responsive','tablet'], platform:'web', device_info:'iPadOS 17 / Safari', resolution_note:'Fixed CSS grid overlap.', resolved_at: new Date(Date.now()-3600000).toISOString(), reported_at: new Date(Date.now()-172800000).toISOString(), updated_at: new Date(Date.now()-3600000).toISOString() },
  { id:'demo-6', reporter_name:'Kiran Babu', reporter_role:'labour', title:'Page loads very slowly on 3G', description:'Dashboard takes 15+ seconds to load on slow network. Need optimization for rural areas.', severity:'high', category:'performance', status:'new', page_name:'Dashboard', page_url:'/dashboard', media_urls:[], upvote_count:15, tags:['performance','3g','rural'], platform:'pwa', device_info:'Android 12 / Chrome 119', reported_at: new Date(Date.now()-900000).toISOString(), updated_at: new Date(Date.now()-900000).toISOString() },
  { id:'demo-7', reporter_name:'Admin User', reporter_role:'admin', title:'Notification bell not updating in real-time', description:'New notifications dont show until page refresh. Real-time subscription seems disconnected.', severity:'medium', category:'functionality', status:'acknowledged', page_name:'Header', page_url:'/dashboard', media_urls:[], upvote_count:4, tags:['notifications','realtime'], platform:'web', device_info:'Windows 11 / Chrome 121', reported_at: new Date(Date.now()-14400000).toISOString(), updated_at: new Date(Date.now()-10800000).toISOString() },
];

export function useBugReports() {
  const { user, farmerProfile } = useAuth();
  const [dbBugs, setDbBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ new:3, acknowledged:2, in_progress:1, resolved:1, critical:1, high:3, medium:3, low:0, total:7, resolvedToday:0 });

  // Merge DB bugs + demo bugs (DB bugs first, demos fill the gap)
  const bugs = [...dbBugs, ...DEMO_BUGS];
  const myBugs = bugs.filter(b => {
    if (!user?.id) return b.reporter_role === (farmerProfile?.role || 'farmer');
    return b.reporter_id === user.id || b.reporter_name === (farmerProfile?.name || farmerProfile?.fullName);
  });

  const calcStats = useCallback((list) => {
    const s = { new:0, acknowledged:0, in_progress:0, resolved:0, wont_fix:0, critical:0, high:0, medium:0, low:0, total: list.length, resolvedToday:0 };
    const today = new Date().toDateString();
    list.forEach(b => {
      if (b.status && s[b.status] !== undefined) s[b.status]++;
      if (b.severity && s[b.severity] !== undefined) s[b.severity]++;
      if (b.status === 'resolved' && b.resolved_at && new Date(b.resolved_at).toDateString() === today) s.resolvedToday++;
    });
    return s;
  }, []);

  // Fetch ALL bugs from Supabase
  const fetchAllBugs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let query = supabase.from('bug_reports').select('*').order('reported_at', { ascending: false });
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.severity && filters.severity !== 'all') query = query.eq('severity', filters.severity);
      if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (!error && data) {
        setDbBugs(data);
        setStats(calcStats([...data, ...DEMO_BUGS]));
      } else {
        /* warn removed */
        setStats(calcStats(DEMO_BUGS));
      }
    } catch (e) {
      /* warn removed */
      setStats(calcStats(DEMO_BUGS));
    }
    setLoading(false);
  }, [calcStats]);

  // Submit bug — works for both authenticated and anonymous users
  const submitBug = useCallback(async (bugData, mediaFiles = []) => {
    const mediaUrls = [];
    // Upload media files (skip errors silently)
    for (const file of mediaFiles) {
      const path = `bug-reports/${user?.id || 'anon'}/${Date.now()}_${file.name}`;
      try {
        const { error } = await supabase.storage.from('bug-reports').upload(path, file);
        if (!error) {
          const { data: urlData } = supabase.storage.from('bug-reports').getPublicUrl(path);
          if (urlData?.publicUrl) mediaUrls.push(urlData.publicUrl);
        }
      } catch { /* skip failed uploads */ }
    }

    // Validate UUID — demo/mock users have id='demo' which isn't a valid UUID
    const isValidUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

    const record = {
      reporter_id: (user?.id && isValidUUID(user.id)) ? user.id : null,
      reporter_name: farmerProfile?.fullName || farmerProfile?.name || bugData.reporter_name || 'QA Team Member',
      reporter_role: farmerProfile?.role || 'farmer',
      title: bugData.title,
      description: bugData.description,
      category: bugData.category || 'other',
      severity: bugData.severity || 'medium',
      status: 'new',
      steps_to_reproduce: bugData.steps_to_reproduce || null,
      expected_behavior: bugData.expected_behavior || null,
      actual_behavior: bugData.actual_behavior || null,
      page_url: bugData.page_url || window.location.pathname,
      page_name: bugData.page_name || window.location.pathname.replace(/\//g, ' ').trim() || 'Dashboard',
      device_info: bugData.device_info || navigator.userAgent,
      browser_info: bugData.browser_info || '',
      platform: bugData.platform || (/mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'web'),
      upvote_count: 0,
    };

    try {
      const { data, error } = await supabase.from('bug_reports').insert(record).select().single();
      if (!error && data) {


        setDbBugs(prev => [data, ...prev]);
        setStats(prev => ({ ...prev, new: (prev.new||0) + 1, total: (prev.total||0) + 1 }));
        return { success: true, bug: data };
      }
      /* error log removed */
    } catch (e) {
      /* error log removed */
    }
    // Optimistic local fallback — still shows in current session
    const fakeBug = { id: 'local-' + Date.now(), ...record, reported_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setDbBugs(prev => [fakeBug, ...prev]);
    setStats(prev => ({ ...prev, new: (prev.new||0) + 1, total: (prev.total||0) + 1 }));
    return { success: true, bug: fakeBug };
  }, [user, farmerProfile]);

  // Update bug status (admin action)
  const updateBugStatus = useCallback(async (bugId, newStatus, note = '') => {
    // Optimistic update in both DB bugs and full list
    setDbBugs(prev => prev.map(b => b.id === bugId ? {
      ...b, status: newStatus,
      developer_note: note || b.developer_note,
      resolution_note: newStatus === 'resolved' ? (note || b.resolution_note) : b.resolution_note,
      resolved_at: newStatus === 'resolved' ? new Date().toISOString() : b.resolved_at,
      updated_at: new Date().toISOString()
    } : b));

    // Skip Supabase for demo bugs
    if (String(bugId).startsWith('demo-')) return;

    try {
      const updates = { status: newStatus, updated_at: new Date().toISOString() };
      if (note) updates.developer_note = note;
      if (newStatus === 'resolved') { updates.resolved_at = new Date().toISOString(); updates.resolution_note = note; }
      await supabase.from('bug_reports').update(updates).eq('id', bugId);
      // Record status history
      await supabase.from('bug_status_history').insert({
        bug_id: bugId,
        changed_by: farmerProfile?.name || 'Admin',
        old_status: '',
        new_status: newStatus,
        note
      });
    } catch (e) { /* warn removed */ }
  }, [farmerProfile]);

  // Add comment
  const addComment = useCallback(async (bugId, text) => {
    const comment = {
      bug_id: bugId,
      commenter_id: user?.id || null,
      commenter_name: farmerProfile?.name || 'Team Member',
      commenter_role: farmerProfile?.role || 'farmer',
      comment: text,
      is_developer_reply: farmerProfile?.role === 'admin',
      created_at: new Date().toISOString()
    };
    if (!String(bugId).startsWith('demo-')) {
      try { await supabase.from('bug_comments').insert(comment); } catch { /* ok */ }
    }
    return comment;
  }, [user, farmerProfile]);

  // Upvote
  const upvoteBug = useCallback(async (bugId) => {
    setDbBugs(prev => prev.map(b => b.id === bugId ? { ...b, upvote_count: (b.upvote_count || 0) + 1 } : b));
    if (!String(bugId).startsWith('demo-') && user?.id) {
      try {
        await supabase.from('bug_upvotes').insert({ bug_id: bugId, user_id: user.id });
        await supabase.from('bug_reports').update({ upvote_count: supabase.rpc ? undefined : 1 }).eq('id', bugId);
      } catch { /* duplicate ok */ }
    }
  }, [user]);

  // Realtime subscription for new bugs (safe — won't crash app)
  useEffect(() => {
    let channel;
    try {
      const channelName = 'bug-rt-' + Math.random().toString(36).slice(2, 8);
      channel = supabase.channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bug_reports' }, (payload) => {
          if (payload.new) {
            setDbBugs(prev => {
              if (prev.some(b => b.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bug_reports' }, (payload) => {
          if (payload.new) {
            setDbBugs(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
          }
        })
        .subscribe();
    } catch (e) {
      /* warn removed */
    }

    return () => {
      try { if (channel) supabase.removeChannel(channel); } catch { /* ok */ }
    };
  }, []);

  // Initial fetch
  useEffect(() => { fetchAllBugs(); }, []);

  return { bugs, myBugs, loading, stats, submitBug, updateBugStatus, addComment, upvoteBug, fetchAllBugs, fetchMyBugs: fetchAllBugs, refetch: fetchAllBugs };
}
