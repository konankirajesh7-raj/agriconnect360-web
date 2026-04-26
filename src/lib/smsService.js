/**
 * SMS OTP Service — Phase 9C
 * Fast2SMS integration for real phone OTP verification
 * Supports Telugu + Hindi OTP templates
 * Wallet: ₹50 balance, ₹0.15/SMS
 */

const FAST2SMS_API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;
const FAST2SMS_BASE = 'https://www.fast2sms.com/dev/bulkV2';

// ── OTP Templates (English, Telugu, Hindi) ────────────────────────────────────

const OTP_TEMPLATES = {
  en: (otp) => `Your AgriConnect 360 OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
  te: (otp) => `మీ AgriConnect 360 OTP: ${otp}. 5 నిమిషాలు చెల్లుబాటు. ఎవరికీ చెప్పకండి.`,
  hi: (otp) => `आपका AgriConnect 360 OTP: ${otp}. 5 मिनट तक मान्य। किसी के साथ साझा न करें।`,
};

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Fast2SMS
 * @param {string} phone - 10-digit Indian mobile number
 * @param {string} language - 'en' | 'te' | 'hi'
 * @returns {object} { success, otp, messageId }
 */
export async function sendOTP(phone, language = 'en') {
  const cleanPhone = phone.replace(/[\s+-]/g, '').slice(-10);

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { success: false, error: 'Invalid Indian mobile number' };
  }

  const otp = generateOTP();
  const message = (OTP_TEMPLATES[language] || OTP_TEMPLATES.en)(otp);

  // Store OTP in sessionStorage with expiry (5 min)
  const otpRecord = {
    otp,
    phone: cleanPhone,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  };
  sessionStorage.setItem(`otp_${cleanPhone}`, JSON.stringify(otpRecord));

  // If no API key, use mock mode (development)
  if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'your_fast2sms_api_key') {
    console.log(`📱 [MOCK SMS] OTP ${otp} sent to ${cleanPhone}`);
    console.log(`📱 Message: ${message}`);
    return { success: true, otp, mock: true, message: 'OTP sent (mock mode)' };
  }

  try {
    // Use Vercel serverless API to avoid CORS issues
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ OTP sent to ${cleanPhone} via Fast2SMS`);
      logOTPDelivery(cleanPhone, 'success', data.request_id);
      return { success: true, otp, messageId: data.request_id };
    } else {
      console.error('❌ Fast2SMS error:', data.error);
      logOTPDelivery(cleanPhone, 'failed', null, data.error);
      // Fallback to mock in case of failure
      return { success: true, otp, mock: true, message: `SMS failed: ${data.error}. OTP logged to console.` };
    }
  } catch (err) {
    console.error('❌ SMS send error:', err.message);
    logOTPDelivery(cleanPhone, 'error', null, err.message);
    // Fallback to mock
    return { success: true, otp, mock: true, message: 'Network error. OTP logged to console.' };
  }
}

/**
 * Verify OTP entered by user
 * @param {string} phone - 10-digit Indian mobile
 * @param {string} enteredOTP - 6-digit OTP entered by user
 * @returns {object} { success, error? }
 */
export function verifyOTP(phone, enteredOTP) {
  const cleanPhone = phone.replace(/[\s+-]/g, '').slice(-10);
  const raw = sessionStorage.getItem(`otp_${cleanPhone}`);

  if (!raw) {
    return { success: false, error: 'No OTP found. Please request a new one.' };
  }

  const record = JSON.parse(raw);

  // Check expiry
  if (Date.now() > record.expiresAt) {
    sessionStorage.removeItem(`otp_${cleanPhone}`);
    return { success: false, error: 'OTP expired. Please request a new one.' };
  }

  // Check max attempts
  if (record.attempts >= 3) {
    sessionStorage.removeItem(`otp_${cleanPhone}`);
    return { success: false, error: 'Too many wrong attempts. Request a new OTP.' };
  }

  // Verify
  if (record.otp === enteredOTP) {
    sessionStorage.removeItem(`otp_${cleanPhone}`);
    return { success: true };
  }

  // Wrong OTP
  record.attempts++;
  sessionStorage.setItem(`otp_${cleanPhone}`, JSON.stringify(record));
  return {
    success: false,
    error: `Wrong OTP. ${3 - record.attempts} attempts remaining.`,
  };
}

/**
 * Track OTP delivery for analytics (Phase 9C)
 */
function logOTPDelivery(phone, status, requestId = null, error = null) {
  const log = JSON.parse(localStorage.getItem('otp_delivery_log') || '[]');
  log.push({
    phone: phone.slice(-4), // Only last 4 digits for privacy
    status,
    requestId,
    error,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  if (log.length > 100) log.splice(0, log.length - 100);
  localStorage.setItem('otp_delivery_log', JSON.stringify(log));
}

/**
 * Get OTP delivery statistics
 */
export function getOTPStats() {
  const log = JSON.parse(localStorage.getItem('otp_delivery_log') || '[]');
  const total = log.length;
  const success = log.filter(l => l.status === 'success').length;
  const failed = log.filter(l => l.status === 'failed').length;
  const errors = log.filter(l => l.status === 'error').length;
  return {
    total,
    success,
    failed,
    errors,
    successRate: total > 0 ? ((success / total) * 100).toFixed(1) + '%' : 'N/A',
    lastAttempt: log.length > 0 ? log[log.length - 1] : null,
  };
}

export default { sendOTP, verifyOTP, getOTPStats };
