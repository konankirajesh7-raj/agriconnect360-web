/**
 * Free SMS / Alert Service —RythuSphere
 * 
 * FREE services integrated:
 * 1. CallMeBot WhatsApp API —completely free, no signup needed for users
 * 2. Browser Notification API (via SW) —free, built-in
 * 3. Supabase Edge Function trigger (uses existing subscription)
 * 
 * For SMS (WhatsApp-based):
 * User registers their WhatsApp number with CallMeBot once,
 * then we send free WhatsApp messages as "SMS alerts"
 */

const CALLMEBOT_BASE = 'https://api.callmebot.com/whatsapp.php';

/**
 * Send a WhatsApp message via CallMeBot (FREE)
 * User must register once at: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * Steps: Save +34 644 59 77 21 → Send "I allow callmebot to send me messages"
 * They get their personal apikey back via WhatsApp
 */
export async function sendWhatsAppAlert(phone, message, apiKey) {
  if (!phone || !apiKey) return { success: false, error: 'Phone/API key missing' };

  // Format: remove +91, 0 prefix, keep 10 digits
  const cleanPhone = phone.replace(/^\+?91/, '').replace(/^0/, '').replace(/\D/g, '');
  if (cleanPhone.length !== 10) return { success: false, error: 'Invalid phone number' };

  const fullPhone = `91${cleanPhone}`;
  const encodedMsg = encodeURIComponent(message);
  const url = `${CALLMEBOT_BASE}?phone=${fullPhone}&text=${encodedMsg}&apikey=${apiKey}`;

  try {
    const res = await fetch(url, { method: 'GET', mode: 'no-cors' });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Price alert SMS/WhatsApp message
 */
export function buildPriceAlertMsg(crop, price, change, district) {
  const dir = change >= 0 ? '📱 UP' : 'x0 DOWN';
  return `🌾 RythuSphere Alert\n\n` +
    `${dir} ${Math.abs(change)}% | ${crop}\n` +
    `Current Price: ₹${price.toLocaleString()}/Q\n` +
    `Market: ${district} APMC\n\n` +
    `Reply STOP to unsubscribe | rythusphere-web.vercel.app`;
}

/**
 * Weather alert message
 */
export function buildWeatherAlertMsg(district, condition, advisory) {
  return `🌾️ RythuSphere Weather Alert\n\n` +
    `${condition} expected in ${district}\n` +
    `Advisory: ${advisory}\n\n` +
    `rythusphere-web.vercel.app`;
}

/**
 * Labour booking confirmation
 */
export function buildLabourBookingMsg(ref, task, date, workers, total) {
  return `✅ RythuSphere —Labour Booked\n\n` +
    `Ref: ${ref}\n` +
    `Task: ${task}\n` +
    `Date: ${date}\n` +
    `Workers: ${workers}\n` +
    `Total: ₹${total.toLocaleString()}\n\n` +
    `rythusphere-web.vercel.app`;
}

/**
 * Send via Supabase Edge Function (server-side SMS if configured)
 * Falls back gracefully if not configured
 */
export async function sendSMSViaSupabase(supabaseClient, phone, message, type = 'alert') {
  try {
    const { data, error } = await supabaseClient.functions.invoke('send-sms', {
      body: { phone, message, type },
    });
    if (error) throw error;
    return { success: true, data };
  } catch {
    // Fallback: log to sms_log table so admin can see pending messages
    try {
      await supabaseClient.from('sms_log').insert({
        phone, message, type, status: 'pending', created_at: new Date().toISOString(),
      });
    } catch {}
    return { success: false, error: 'SMS service not configured —logged for review' };
  }
}

/**
 * Check if CallMeBot API key is set up for a user
 */
export function hasCallMeBotKey(farmerId) {
  return !!localStorage.getItem(`callmebot_key_${farmerId}`);
}

export function getCallMeBotKey(farmerId) {
  return localStorage.getItem(`callmebot_key_${farmerId}`) || '';
}

export function saveCallMeBotKey(farmerId, key) {
  localStorage.setItem(`callmebot_key_${farmerId}`, key);
}

/**
 * Registration instructions for CallMeBot (shown to users)
 */
export const CALLMEBOT_SETUP_STEPS = [
  'Save this number in your contacts: +34 644 59 77 21',
  'Open WhatsApp and send: "I allow callmebot to send me messages"',
  'You will receive your personal API Key via WhatsApp',
  'Enter that API Key below to activate WhatsApp alerts',
];
