import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',   import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const hColor = h => h >= 80 ? '#22c55e' : h >= 60 ? '#f59e0b' : '#ef4444';

// ALL ROLES ON MAP — farmers, cold storage, industries, dairy, transport, brokers
const ROLE_NODES = [
  // Neighbour Farmers
  { id:'f1', type:'farmer', name:"Ravi's East Plot",    lat:16.3200, lng:80.4500, crop:'Cotton',    health:82, owner:'Ravi Kumar',     phone:'9876500001', soil:'Black Cotton', irr:'Borewell',  note:'Sprays neem oil weekly', area:3.2 },
  { id:'f2', type:'farmer', name:'Lakshmi Paddy Field', lat:16.2950, lng:80.4200, crop:'Paddy',     health:90, owner:'Lakshmi Devi',    phone:'9876500002', soil:'Alluvial',     irr:'Canal',     note:'Organic compost every season', area:2.0 },
  { id:'f3', type:'farmer', name:'Suresh Chilli Farm',  lat:16.3100, lng:80.4600, crop:'Chilli',    health:74, owner:'Suresh Reddy',    phone:'9876500003', soil:'Red Loamy',    irr:'Drip',      note:'Drip + fertigation', area:1.5 },
  { id:'f4', type:'farmer', name:'Annapurna Groundnut', lat:16.2800, lng:80.4350, crop:'Groundnut', health:68, owner:'Annapurna Rao',    phone:'9876500004', soil:'Sandy Loam',   irr:'Rainfed',   note:'Gypsum + raised beds', area:4.0 },
  { id:'f5', type:'farmer', name:'Venkat Maize Plot',   lat:16.3300, lng:80.4100, crop:'Maize',     health:85, owner:'Venkat Varma',    phone:'9876500005', soil:'Clay',         irr:'Sprinkler', note:'Inter-cropping with cowpea', area:2.5 },
  { id:'f6', type:'farmer', name:'Krishna Sugarcane',   lat:16.2900, lng:80.4650, crop:'Sugarcane', health:92, owner:'Krishna Murthy',   phone:'9876500006', soil:'Alluvial',     irr:'River',     note:'Trash mulching, Ratoon management', area:5.0 },
  // Cold Storage
  { id:'cs1', type:'cold_storage', name:'Sri Sai Cold Storage',    lat:16.3050, lng:80.4250, owner:'M. Raghava',   phone:'9876502001', capacity:'5000 MT', crops:'All vegetables, fruits', rate:'₹8/kg/month', dist:'2.1 km' },
  { id:'cs2', type:'cold_storage', name:'Lakshmi Refrigeration',   lat:16.2860, lng:80.4540, owner:'K. Surekha',   phone:'9876502002', capacity:'3000 MT', crops:'Paddy, Chilli',        rate:'₹6/kg/month', dist:'3.4 km' },
  // Industries / Buyers
  { id:'i1', type:'industry', name:'Raju Cotton Ginning Mill',     lat:16.3180, lng:80.4080, owner:'P. Raju Naidu',  phone:'9876503001', buys:'Cotton', rate:'₹7,550/qtl', minQty:'5 Q', payment:'Within 24h' },
  { id:'i2', type:'industry', name:'AP Chilli Export House',        lat:16.2980, lng:80.4700, owner:'S. Krishna',     phone:'9876503002', buys:'Chilli', rate:'₹9,200/qtl', minQty:'10 Q', payment:'3 days' },
  { id:'i3', type:'industry', name:'Sri Sai Sugar Factory',         lat:16.3220, lng:80.4380, owner:'T. Venkat',      phone:'9876503003', buys:'Sugarcane', rate:'₹3,600/T', minQty:'100 T', payment:'Weekly' },
  // Dairy
  { id:'d1', type:'dairy', name:'Vijaya Milk Dairy',                lat:16.3090, lng:80.4490, owner:'B. Vijaya',     phone:'9876504001', collects:'Every morning 6AM', rate:'₹38/L', cattle:'Yes — sells feed too' },
  { id:'d2', type:'dairy', name:'AP Farmer Dairy Cooperative',      lat:16.2920, lng:80.4310, owner:'FPO Admin',     phone:'9876504002', collects:'6AM & 6PM',         rate:'₹40/L', cattle:'Veterinary support available' },
  // Transport
  { id:'t1', type:'transport', name:'Ramu Transport Services',      lat:16.3140, lng:80.4200, owner:'G. Ramu',       phone:'9876505001', trucks:'6 trucks (5T-15T)', route:'Guntur→Hyderabad', rate:'₹1,200/trip' },
  { id:'t2', type:'transport', name:'AP Agri Logistics',            lat:16.2850, lng:80.4420, owner:'N. Prasad',     phone:'9876505002', trucks:'10 trucks (up to 20T)', route:'All AP Districts', rate:'₹15/km' },
];

const ROLE_CONFIG = {
  farmer:      { color:'#22c55e', emoji:'🌾', label:'Farmer Field',  size:36 },
  cold_storage:{ color:'#06b6d4', emoji:'❄️', label:'Cold Storage',  size:34 },
  industry:    { color:'#8b5cf6', emoji:'🏭', label:'Industry/Buyer',size:34 },
  dairy:       { color:'#f59e0b', emoji:'🐄', label:'Dairy',         size:34 },
  transport:   { color:'#f97316', emoji:'🚛', label:'Transport',     size:34 },
  my_field:    { color:'#22c55e', emoji:'🌾', label:'My Field',      size:40 },
};

const MY_COORDS = [
  { id:1, lat:16.3067, lng:80.4365 }, { id:2, lat:16.3020, lng:80.4280 },
  { id:3, lat:16.3140, lng:80.4420 }, { id:4, lat:16.2970, lng:80.4480 },
  { id:5, lat:16.3080, lng:80.4150 }, { id:6, lat:16.3200, lng:80.4300 },
];

function makeIcon(color, emoji, size, pulse) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.42)}px;border:3px solid #fff;box-shadow:0 2px 14px rgba(0,0,0,0.4);cursor:pointer;${pulse?`animation:mp 2s ease-in-out infinite;`:''}">${emoji}</div><style>@keyframes mp{0%,100%{box-shadow:0 0 0 0 ${color}80}50%{box-shadow:0 0 0 10px ${color}00}}</style>`,
    iconSize:[size,size], iconAnchor:[size/2,size/2], popupAnchor:[0,-size/2],
  });
}

function rolePopup(node) {
  if (node.type === 'farmer') return `<b>🌾 ${node.name}</b><br/>🌱 <b>${node.crop}</b> · ${node.area} ac<br/>👤 ${node.owner}<br/>💧 ${node.irr} · ${node.soil}<br/><span style="color:#22c55e;font-weight:700">Health: ${node.health}%</span>`;
  if (node.type === 'cold_storage') return `<b>❄️ ${node.name}</b><br/>📦 ${node.capacity}<br/>🌾 ${node.crops}<br/>💰 ${node.rate}<br/>📍 ${node.dist} away`;
  if (node.type === 'industry') return `<b>🏭 ${node.name}</b><br/>🛒 Buys: <b>${node.buys}</b><br/>💰 ${node.rate} · Min ${node.minQty}<br/>⏰ Payment: ${node.payment}`;
  if (node.type === 'dairy') return `<b>🐄 ${node.name}</b><br/>🕕 ${node.collects}<br/>💰 ${node.rate}<br/>ℹ️ ${node.cattle}`;
  if (node.type === 'transport') return `<b>🚛 ${node.name}</b><br/>🚚 ${node.trucks}<br/>🛣️ ${node.route}<br/>💰 ${node.rate}`;
  return `<b>${node.name}</b>`;
}

export default function FieldMap({ myFields = [], onFieldSelect, height = 520 }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const [activeTypes, setActiveTypes] = useState({ farmer:true, cold_storage:true, industry:true, dairy:true, transport:true });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl:true }).setView([16.3067, 80.4365], 13);
    mapRef.current = map;
    // CartoDB Voyager — reliable worldwide CDN, no CORS issues
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);


    const coordMap = {};
    MY_COORDS.forEach(c => { coordMap[c.id] = c; });

    // My fields (pulsing green/yellow/red)
    myFields.forEach((f, i) => {
      const lat = coordMap[f.id]?.lat ?? (16.3067 + (i-2)*0.007);
      const lng = coordMap[f.id]?.lng ?? (80.4365 + (i-2)*0.009);
      const c   = hColor(f.health || 80);
      const icon = makeIcon(c, '🌾', 40, true);
      const m = L.marker([lat, lng], { icon }).addTo(map);
      const node = { ...f, type:'my_field', lat, lng, owner:'My Field', isMyField:true };
      m.bindPopup(`<b>🌾 ${f.field_name}</b><br/>🌱 <b>${f.current_crop||'—'}</b> · ${f.area_acres} ac<br/>🧱 ${f.soil_type} · 💧 ${f.irrigation_type}<br/><span style="color:${c};font-weight:700">Health: ${f.health||80}%</span><br/><small style="color:#60a5fa">Click for actions</small>`, { maxWidth:220 });
      m.on('click', () => { m.openPopup(); if (onFieldSelect) onFieldSelect(node); });
    });

    // All role nodes
    ROLE_NODES.forEach(node => {
      const cfg  = ROLE_CONFIG[node.type] || ROLE_CONFIG.farmer;
      const icon = makeIcon(cfg.color, cfg.emoji, cfg.size, false);
      const m = L.marker([node.lat, node.lng], { icon }).addTo(map);
      m.bindPopup(`<div style="font-family:sans-serif;font-size:0.82rem">${rolePopup(node)}<br/><a href="tel:${node.phone}" style="color:#22c55e">📞 ${node.phone}</a> · <a href="https://wa.me/91${node.phone}" target="_blank" style="color:#25d366">💬 WhatsApp</a></div>`, { maxWidth:250 });
      m.on('click', () => { m.openPopup(); if (onFieldSelect) onFieldSelect({ ...node, isNeighbour: node.type!=='my_field' }); });
    });

    // GPS
    const locBtn = L.control({ position:'topleft' });
    locBtn.onAdd = () => {
      const div = L.DomUtil.create('div','leaflet-bar leaflet-control');
      const a = L.DomUtil.create('a','',div);
      a.title = 'My GPS Location'; a.innerHTML = '📍';
      a.style.cssText='display:flex;align-items:center;justify-content:center;width:30px;height:30px;font-size:1rem;cursor:pointer;text-decoration:none;color:#333;background:#fff;';
      L.DomEvent.on(a,'click',e=>{ L.DomEvent.stopPropagation(e); navigator.geolocation?.getCurrentPosition(p=>map.flyTo([p.coords.latitude,p.coords.longitude],15,{animate:true,duration:1.5})); });
      return div;
    };
    locBtn.addTo(map);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div style={{ position:'relative', borderRadius:14, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
      {/* Legend */}
      <div style={{ position:'absolute',top:12,right:12,zIndex:1000,background:'rgba(8,12,20,0.9)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'10px 14px',fontSize:'0.7rem',color:'#fff',pointerEvents:'none' }}>
        <div style={{ fontWeight:700,marginBottom:6,color:'#a78bfa' }}>🗺️ Map Legend</div>
        {Object.entries(ROLE_CONFIG).filter(([k])=>k!=='my_field').map(([k,v])=>(
          <div key={k} style={{ display:'flex',alignItems:'center',gap:6,marginBottom:3 }}>
            <span style={{ fontSize:'0.85rem' }}>{v.emoji}</span>
            <span style={{ width:8,height:8,borderRadius:'50%',background:v.color,display:'inline-block' }} />
            <span>{v.label}</span>
          </div>
        ))}
        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:3 }}>
          <span style={{ fontSize:'0.85rem' }}>🌾</span>
          <span style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block' }} />
          <span>My Fields (pulse)</span>
        </div>
        <div style={{ marginTop:6,color:'rgba(255,255,255,0.4)',fontSize:'0.62rem' }}>Click any pin → full details + contact</div>
      </div>
      <div ref={containerRef} style={{ height, width:'100%' }} />
    </div>
  );
}
