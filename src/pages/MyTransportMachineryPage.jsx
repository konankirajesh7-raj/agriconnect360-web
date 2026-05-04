import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const AP_DISTRICTS = ['Guntur','Krishna','Anantapur','Chittoor','Kurnool','Prakasam','Nellore','East Godavari','West Godavari','Visakhapatnam','Vizianagaram','Srikakulam','Kadapa'];

const VEHICLE_TYPES = ['Mini Truck','Medium Truck','Large Truck','Tractor Trolley','Pickup Van','Tempo','Tanker','Refrigerated Van'];
const MACHINERY_TYPES = ['Tractor','Rotavator','Harvester','Power Sprayer','Seed Drill','Thresher','Power Tiller','Drip Irrigation Kit','Boom Sprayer','Plough','Cultivator'];
const STATUS_MAP = {
  active: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Active' },
  idle: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Idle' },
  maintenance: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Maintenance' },
  rented: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', label: 'Rented Out' },
};

const STORAGE_KEY = 'rythu_my_transport_machinery';

export default function MyTransportMachineryPage() {
  const { farmerProfile, userRole } = useAuth();
  const userId = farmerProfile?.id || 'guest';

  // Block customers
  if (userRole === 'customer') {
    return (
      <div className="animated" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>�xa�</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Not Available</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Transport & Machinery management is available for Farmers, Brokers, Suppliers, Industrial Buyers and Labour roles.</div>
      </div>
    );
  }

  const [tab, setTab] = useState('my-items');
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [trackingItem, setTrackingItem] = useState(null);
  const [form, setForm] = useState({
    category: 'transport', type: '', name: '', registration: '', capacity: '',
    rate: '', district: 'Guntur', location: '', condition: 'Good', description: '',
    status: 'active',
  });

  // Load from Supabase (fallback to localStorage)
  const loadItems = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('transport_machinery').select('*').eq('user_id', farmerProfile?.id || userId).order('created_at', { ascending: false });
      if (!error && data) { setItems(data); return; }
    } catch { /* fallback */ }
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [userId, farmerProfile]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Persist to Supabase + localStorage
  const persist = (updated) => {
    setItems(updated);
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
  };

  const resetForm = () => setForm({
    category: 'transport', type: '', name: '', registration: '', capacity: '',
    rate: '', district: 'Guntur', location: '', condition: 'Good', description: '',
    status: 'active',
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.type) return;
    const newItem = {
      user_id: farmerProfile?.id || userId,
      user_name: farmerProfile?.name || 'User',
      user_role: userRole || 'farmer',
      category: form.category,
      item_type: form.type,
      name: form.name,
      registration_number: form.registration,
      description: form.description,
      rate_per_day: form.rate ? Number(form.rate) : null,
      location: form.location || form.district,
      status: form.status,
      capacity: form.capacity,
      condition: form.condition,
      activity_log: [{ date: new Date().toISOString(), event: 'Item registered', status: 'active' }],
    };
    try {
      const { data, error } = await supabase.from('transport_machinery').insert(newItem).select().single();
      if (!error && data) { setItems(prev => [data, ...prev]); resetForm(); setShowAdd(false); return; }
    } catch { /* fallback */ }
    // localStorage fallback
    const localItem = { ...newItem, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), trackingLog: newItem.activity_log, type: form.type, rate: form.rate, registration: form.registration, ownerId: userId, ownerName: farmerProfile?.name || 'User', ownerRole: userRole || 'farmer' };
    persist([localItem, ...items]);
    resetForm();
    setShowAdd(false);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const logEntry = { date: new Date().toISOString(), event: `Status �  ${STATUS_MAP[form.status]?.label || form.status}`, status: form.status };
    try {
      const existingLog = editItem.activity_log || editItem.trackingLog || [];
      const { data, error } = await supabase.from('transport_machinery').update({
        category: form.category, item_type: form.type, name: form.name, registration_number: form.registration,
        description: form.description, rate_per_day: form.rate ? Number(form.rate) : null,
        location: form.location || form.district, status: form.status, capacity: form.capacity, condition: form.condition,
        activity_log: [...existingLog, logEntry],
      }).eq('id', editItem.id).select().single();
      if (!error && data) { setItems(prev => prev.map(it => it.id === editItem.id ? data : it)); setEditItem(null); resetForm(); return; }
    } catch { /* fallback */ }
    const updated = items.map(it => it.id === editItem.id ? {
      ...it, ...form, updatedAt: new Date().toISOString(),
      trackingLog: [...(it.trackingLog || []), logEntry],
    } : it);
    persist(updated);
    setEditItem(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await supabase.from('transport_machinery').delete().eq('id', id);
    } catch { /* ignore */ }
    persist(items.filter(it => it.id !== id));
  };

  const startEdit = (item) => {
    setEditItem(item);
    setForm({
      category: item.category, type: item.item_type || item.type, name: item.name, registration: item.registration_number || item.registration || '',
      capacity: item.capacity || '', rate: item.rate_per_day || item.rate || '', district: item.district || 'Guntur',
      location: item.location || '', condition: item.condition || 'Good', description: item.description || '',
      status: item.status || 'active',
    });
  };

  const myItems = items.filter(it => (it.user_id === (farmerProfile?.id || userId)) || (it.ownerId === userId));
  const transportItems = myItems.filter(it => it.category === 'transport');
  const machineryItems = myItems.filter(it => it.category === 'machinery');

  const INP = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' };
  const LBL = { display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 10 }}>�xa: My Transport & Machinery</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Register, manage & track your vehicles and farm machinery</div>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true); setEditItem(null); }} style={{
          padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
        }}>
          �~" Add New Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { l: 'Total Items', v: myItems.length, i: '�x9', c: '#3b82f6' },
          { l: 'Transport', v: transportItems.length, i: '�xa:', c: '#22c55e' },
          { l: 'Machinery', v: machineryItems.length, i: '�xaS', c: '#f59e0b' },
          { l: 'Active Now', v: myItems.filter(i => i.status === 'active').length, i: '�S&', c: '#10b981' },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.i}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['my-items', '�x9', 'My Items'], ['transport', '�xa:', 'Transport'], ['machinery', '�xaS', 'Machinery']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 18px', borderRadius: 22, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            background: tab === id ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'var(--bg-card)',
            color: tab === id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Items List */}
      {(() => {
        const filtered = tab === 'transport' ? transportItems : tab === 'machinery' ? machineryItems : myItems;
        if (filtered.length === 0) return (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{tab === 'transport' ? '�xa:' : tab === 'machinery' ? '�xaS' : '�x9'}</div>
            <div style={{ fontWeight: 700 }}>No {tab === 'my-items' ? '' : tab} items yet</div>
            <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Click "Add New Item" to register your transport or machinery</div>
          </div>
        );
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map(item => {
              const st = STATUS_MAP[item.status] || STATUS_MAP.active;
              return (
                <div key={item.id} className="card" style={{ padding: 18, border: `1px solid ${st.color}22` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: item.category === 'transport' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        {item.category === 'transport' ? '�xa:' : '�xaS'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.item_type || item.type} · �x� {item.location || item.district}</div>
                      </div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700 }}>{st.label}</span>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                    {(item.registration_number || item.registration) && <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>�x {item.registration_number || item.registration}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      {item.capacity && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>�x� {item.capacity}</span>}
                      {(item.rate_per_day || item.rate) && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>�x� ��{item.rate_per_day || item.rate}/hr</span>}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>�x� {item.condition}</span>
                    </div>
                    {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{item.description}</div>}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Added {new Date(item.created_at || item.createdAt).toLocaleDateString()} · Updated {new Date(item.updated_at || item.updatedAt).toLocaleDateString()}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setTrackingItem(item)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>�x� Track</button>
                    <button onClick={() => startEdit(item)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>�S�️ Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>�x️</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* �"��"��"� ADD / EDIT MODAL �"��"��"� */}
      {(showAdd || editItem) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }} onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }}>
          <div style={{ width: 520, maxHeight: '85vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 20, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 20 }}>
              {editItem ? '�S�️ Edit Item' : '�~" Register New Transport / Machinery'}
            </div>

            {/* Category Toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[['transport', '�xa:', 'Transport'], ['machinery', '�xaS', 'Machinery']].map(([cat, icon, label]) => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat, type: '' }))} style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${form.category === cat ? '#3b82f6' : 'var(--border)'}`,
                  background: form.category === cat ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                  color: form.category === cat ? '#3b82f6' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
                }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LBL}>Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={INP}>
                  <option value="">Select type...</option>
                  {(form.category === 'transport' ? VEHICLE_TYPES : MACHINERY_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LBL}>Name / Title *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={form.category === 'transport' ? 'e.g. Tata Ace Gold AP-07-XX-1234' : 'e.g. Mahindra 575 DI Tractor'} style={INP} />
              </div>
              <div>
                <label style={LBL}>Registration / ID</label>
                <input value={form.registration} onChange={e => setForm(f => ({ ...f, registration: e.target.value }))} placeholder="AP-07-AB-1234" style={INP} />
              </div>
              <div>
                <label style={LBL}>{form.category === 'transport' ? 'Capacity' : 'HP / Power'}</label>
                <input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder={form.category === 'transport' ? '5 Tons' : '45 HP'} style={INP} />
              </div>
              <div>
                <label style={LBL}>Rate (��/hr)</label>
                <input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="1200" style={INP} />
              </div>
              <div>
                <label style={LBL}>Condition</label>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={INP}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label style={LBL}>District</label>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={INP}>
                  {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Tenali" style={INP} />
              </div>
              {editItem && (
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={LBL}>Status</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <button key={key} onClick={() => setForm(f => ({ ...f, status: key }))} style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${form.status === key ? val.color : 'var(--border)'}`,
                        background: form.status === key ? val.bg : 'transparent', color: form.status === key ? val.color : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem',
                      }}>{val.label}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={LBL}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." style={{ ...INP, resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={editItem ? handleUpdate : handleAdd} disabled={!form.name.trim() || !form.type} style={{
                flex: 1, padding: 13, borderRadius: 10, border: 'none',
                background: (form.name.trim() && form.type) ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'var(--border)',
                color: (form.name.trim() && form.type) ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
              }}>
                {editItem ? '�S& Update Item' : '�~" Register Item'}
              </button>
              <button onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }} style={{ padding: '13px 24px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* �"��"��"� TRACKING MODAL �"��"��"� */}
      {trackingItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }} onClick={() => setTrackingItem(null)}>
          <div style={{ width: 480, maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 20, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>�x� Tracking: {trackingItem.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{trackingItem.item_type || trackingItem.type} · {trackingItem.category === 'transport' ? '�xa:' : '�xaS'}</div>
              </div>
              <button onClick={() => setTrackingItem(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-muted)' }}>�S"</button>
            </div>

            {/* Current Status */}
            <div style={{ background: (STATUS_MAP[trackingItem.status] || STATUS_MAP.active).bg, border: `1px solid ${(STATUS_MAP[trackingItem.status] || STATUS_MAP.active).color}33`, borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Status</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: (STATUS_MAP[trackingItem.status] || STATUS_MAP.active).color, marginTop: 4 }}>
                {(STATUS_MAP[trackingItem.status] || STATUS_MAP.active).label}
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                ['Type', trackingItem.item_type || trackingItem.type],
                ['Registration', trackingItem.registration_number || trackingItem.registration || '�'],
                ['Location', `${trackingItem.location || ''} ${trackingItem.district || ''}`],
                ['Condition', trackingItem.condition],
                ['Rate', (trackingItem.rate_per_day || trackingItem.rate) ? `��${trackingItem.rate_per_day || trackingItem.rate}/hr` : '�'],
                ['Capacity', trackingItem.capacity || '�'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Activity Log */}
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>�xS Activity Log</div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {(trackingItem.activity_log || trackingItem.trackingLog || []).slice().reverse().map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: (STATUS_MAP[log.status] || STATUS_MAP.active).color, marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{log.event}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {(!(trackingItem.activity_log || trackingItem.trackingLog) || (trackingItem.activity_log || trackingItem.trackingLog || []).length === 0) && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: 20 }}>No activity recorded</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
