// ═══════════════════════════════════════════════════════════════════════
// GPS Location Service — Browser Geolocation + Reverse Geocoding
// Shows village/mandal/district/state/pincode in Telugu+English+Hindi
// ═══════════════════════════════════════════════════════════════════════

let watchId = null;

export async function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000, ...options }
    );
  });
}

export function watchPosition(callback, errorCallback) {
  if (!navigator.geolocation) return null;
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    (pos) => callback({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }),
    errorCallback || (() => {}),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
  );
  return watchId;
}

export function stopWatching() {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
}

// ── Reverse Geocode with multiple fallback APIs ──
export async function reverseGeocode(lat, lng) {
  // Try Nominatim first
  let data = await tryNominatim(lat, lng);
  if (!data) data = await tryBigDataCloud(lat, lng);
  if (!data) data = buildFallbackFromCoords(lat, lng);
  return data;
}

async function tryNominatim(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=en`,
      { headers: { 'User-Agent': 'AgriConnect360-Web/1.0 (agriconnect360-web.vercel.app)' } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const addr = json.address || {};
    console.log('📍 Nominatim response:', JSON.stringify(addr));
    
    const village = addr.village || addr.hamlet || addr.town || addr.city_district || addr.suburb || addr.neighbourhood || addr.city || '';
    const mandal = addr.county || addr.town || addr.suburb || '';
    const district = addr.state_district || addr.city || addr.county || '';
    const state = addr.state || '';
    const pincode = addr.postcode || '';

    if (!village && !district && !state) return null; // Empty response, try next API

    const te = translateToTelugu(village, mandal, district, state);
    const hi = translateToHindi(village, mandal, district, state);

    return {
      en: { village, mandal: mandal !== village ? mandal : '', district, state, pincode, country: addr.country || 'India', displayName: json.display_name || '' },
      te: { village: te.village, mandal: te.mandal, district: te.district, state: te.state, pincode, country: 'భారతదేశం' },
      hi: { village: hi.village, mandal: hi.mandal, district: hi.district, state: hi.state, pincode, country: 'भारत' },
      lat, lng, timestamp: Date.now(), source: 'nominatim',
    };
  } catch (e) {
    console.warn('Nominatim failed:', e.message);
    return null;
  }
}

async function tryBigDataCloud(lat, lng) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log('📍 BigDataCloud response:', json.locality, json.city, json.principalSubdivision);

    const village = json.locality || json.city || '';
    const mandal = json.localityInfo?.administrative?.find(a => a.order === 8)?.name || json.city || '';
    const district = json.localityInfo?.administrative?.find(a => a.order === 7)?.name || json.city || '';
    const state = json.principalSubdivision || '';
    const pincode = json.postcode || '';

    const te = translateToTelugu(village, mandal, district, state);
    const hi = translateToHindi(village, mandal, district, state);

    return {
      en: { village, mandal, district, state, pincode, country: json.countryName || 'India', displayName: `${village}, ${district}, ${state}` },
      te: { village: te.village, mandal: te.mandal, district: te.district, state: te.state, pincode, country: 'భారతదేశం' },
      hi: { village: hi.village, mandal: hi.mandal, district: hi.district, state: hi.state, pincode, country: 'भारत' },
      lat, lng, timestamp: Date.now(), source: 'bigdatacloud',
    };
  } catch (e) {
    console.warn('BigDataCloud failed:', e.message);
    return null;
  }
}

function buildFallbackFromCoords(lat, lng) {
  // Estimate AP district from coordinates
  const apDistrict = estimateAPDistrict(lat, lng);
  return {
    en: { village: '', mandal: '', district: apDistrict.en, state: 'Andhra Pradesh', pincode: '', country: 'India', displayName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` },
    te: { village: '', mandal: '', district: apDistrict.te, state: 'ఆంధ్ర ప్రదేశ్', pincode: '', country: 'భారతదేశం' },
    hi: { village: '', mandal: '', district: apDistrict.hi, state: 'आंध्र प्रदेश', pincode: '', country: 'भारत' },
    lat, lng, timestamp: Date.now(), source: 'fallback',
  };
}

function estimateAPDistrict(lat, lng) {
  // Rough bounding boxes for AP districts
  const districts = [
    { en: 'Srikakulam', te: 'శ్రీకాకుళం', hi: 'श्रीकाकुलम', latMin: 18.2, latMax: 19.1, lngMin: 83.5, lngMax: 84.8 },
    { en: 'Vizianagaram', te: 'విజయనగరం', hi: 'विजयनगरम', latMin: 17.7, latMax: 18.7, lngMin: 83.0, lngMax: 83.8 },
    { en: 'Visakhapatnam', te: 'విశాఖపట్నం', hi: 'विशाखापट्टनम', latMin: 17.2, latMax: 18.3, lngMin: 82.5, lngMax: 83.5 },
    { en: 'East Godavari', te: 'తూర్పు గోదావరి', hi: 'पूर्वी गोदावरी', latMin: 16.5, latMax: 17.8, lngMin: 81.4, lngMax: 82.5 },
    { en: 'West Godavari', te: 'పశ్చిమ గోదావరి', hi: 'पश्चिमी गोदावरी', latMin: 16.2, latMax: 17.2, lngMin: 80.8, lngMax: 81.6 },
    { en: 'Krishna', te: 'కృష్ణా', hi: 'कृष्णा', latMin: 15.8, latMax: 17.0, lngMin: 80.2, lngMax: 81.2 },
    { en: 'Guntur', te: 'గుంటూరు', hi: 'गुंटूर', latMin: 15.5, latMax: 16.8, lngMin: 79.5, lngMax: 80.8 },
    { en: 'Prakasam', te: 'ప్రకాశం', hi: 'प्रकाशम', latMin: 15.0, latMax: 16.2, lngMin: 79.0, lngMax: 80.2 },
    { en: 'Nellore', te: 'నెల్లూరు', hi: 'नेल्लोर', latMin: 13.8, latMax: 15.2, lngMin: 79.2, lngMax: 80.2 },
    { en: 'Kurnool', te: 'కర్నూలు', hi: 'कुर्नूल', latMin: 15.0, latMax: 16.2, lngMin: 77.5, lngMax: 78.8 },
    { en: 'Anantapur', te: 'అనంతపురం', hi: 'अनंतपुर', latMin: 14.2, latMax: 15.5, lngMin: 76.8, lngMax: 78.2 },
    { en: 'Chittoor', te: 'చిత్తూరు', hi: 'चित्तूर', latMin: 12.8, latMax: 14.2, lngMin: 78.5, lngMax: 79.8 },
    { en: 'YSR Kadapa', te: 'కడప', hi: 'कडपा', latMin: 14.2, latMax: 15.5, lngMin: 78.0, lngMax: 79.5 },
  ];
  for (const d of districts) {
    if (lat >= d.latMin && lat <= d.latMax && lng >= d.lngMin && lng <= d.lngMax) {
      return d;
    }
  }
  return { en: 'Andhra Pradesh', te: 'ఆంధ్ర ప్రదేశ్', hi: 'आंध्र प्रदेश' };
}

export async function getFullLocation() {
  const pos = await getCurrentPosition();
  const geo = await reverseGeocode(pos.lat, pos.lng);
  return { ...geo, accuracy: pos.accuracy, lat: pos.lat, lng: pos.lng };
}

// ── Telugu translations for AP ──
const DISTRICT_TE = {
  'Anantapur': 'అనంతపురం', 'Anantapuram': 'అనంతపురం', 'Chittoor': 'చిత్తూరు',
  'East Godavari': 'తూర్పు గోదావరి', 'Guntur': 'గుంటూరు', 'Kadapa': 'కడప', 'YSR Kadapa': 'కడప', 'YSR District': 'కడప',
  'Krishna': 'కృష్ణా', 'Kurnool': 'కర్నూలు', 'Nellore': 'నెల్లూరు', 'Sri Potti Sriramulu Nellore': 'నెల్లూరు', 'SPSR Nellore': 'నెల్లూరు',
  'Prakasam': 'ప్రకాశం', 'Srikakulam': 'శ్రీకాకుళం', 'Visakhapatnam': 'విశాఖపట్నం', 'Vishakhapatnam': 'విశాఖపట్నం',
  'Vizianagaram': 'విజయనగరం', 'West Godavari': 'పశ్చిమ గోదావరి',
  'Palnadu': 'పల్నాడు', 'Bapatla': 'బాపట్ల', 'Eluru': 'ఏలూరు', 'NTR': 'ఎన్టీఆర్',
  'Kakinada': 'కాకినాడ', 'Konaseema': 'కోనసీమ', 'Alluri Sitharama Raju': 'అల్లూరి సీతారామరాజు',
  'Anakapalli': 'అనకాపల్లి', 'Manyam': 'మన్యం', 'Parvathipuram Manyam': 'పార్వతీపురం మన్యం',
  'Nandyal': 'నంద్యాల', 'Tirupati': 'తిరుపతి', 'Annamayya': 'అన్నమయ్య',
};
const STATE_TE = { 'Andhra Pradesh': 'ఆంధ్ర ప్రదేశ్', 'Telangana': 'తెలంగాణ', 'Karnataka': 'కర్ణాటక', 'Tamil Nadu': 'తమిళనాడు', 'Odisha': 'ఒడిశా' };

const DISTRICT_HI = {
  'Anantapur': 'अनंतपुर', 'Chittoor': 'चित्तूर', 'East Godavari': 'पूर्वी गोदावरी',
  'Guntur': 'गुंटूर', 'Kadapa': 'कडपा', 'Krishna': 'कृष्णा', 'Kurnool': 'कुर्नूल',
  'Nellore': 'नेल्लोर', 'Prakasam': 'प्रकाशम', 'Srikakulam': 'श्रीकाकुलम',
  'Visakhapatnam': 'विशाखापट्टनम', 'Vizianagaram': 'विजयनगरम', 'West Godavari': 'पश्चिमी गोदावरी',
  'Tirupati': 'तिरुपति', 'Nandyal': 'नंद्याल', 'Kakinada': 'काकीनाडा',
};
const STATE_HI = { 'Andhra Pradesh': 'आंध्र प्रदेश', 'Telangana': 'तेलंगाना', 'Karnataka': 'कर्नाटक', 'Tamil Nadu': 'तमिलनाडु', 'Odisha': 'ओडिशा' };

function translateToTelugu(village, mandal, district, state) {
  return {
    village: village || '',
    mandal: mandal || '',
    district: DISTRICT_TE[district] || district || '',
    state: STATE_TE[state] || state || '',
  };
}

function translateToHindi(village, mandal, district, state) {
  return {
    village: village || '',
    mandal: mandal || '',
    district: DISTRICT_HI[district] || district || '',
    state: STATE_HI[state] || state || '',
  };
}

export async function checkLocationPermission() {
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch { return 'prompt'; }
}
