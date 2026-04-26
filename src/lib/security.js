/**
 * AgriConnect 360 — Security Utilities (Phase 15A)
 * Input sanitization, rate limiting, CSRF protection, XSS prevention
 */

/** 15A.4 — Input Sanitization (XSS Prevention) */
const DANGEROUS_PATTERNS = [
  /<script[\s>]/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /eval\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /innerHTML/gi,
  /outerHTML/gi,
  /insertAdjacentHTML/gi,
];

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  let clean = input;
  clean = clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  return clean;
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[sanitizeInput(key)] = typeof value === 'object' ? sanitizeObject(value) : sanitizeInput(value);
  }
  return clean;
}

export function detectXSS(input) {
  if (typeof input !== 'string') return false;
  return DANGEROUS_PATTERNS.some(p => p.test(input));
}

export function validateInput(value, rules = {}) {
  const errors = [];
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) errors.push('This field is required');
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) errors.push(`Minimum ${rules.minLength} characters`);
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) errors.push(`Maximum ${rules.maxLength} characters`);
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) errors.push(rules.patternMessage || 'Invalid format');
  if (rules.phone && !/^[6-9]\d{9}$/.test(value)) errors.push('Invalid Indian phone number');
  if (rules.aadhaar && !/^\d{12}$/.test(value?.replace(/\s/g, ''))) errors.push('Invalid Aadhaar number');
  if (rules.pincode && !/^\d{6}$/.test(value)) errors.push('Invalid PIN code');
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push('Invalid email');
  if (rules.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(value)) errors.push('Invalid GSTIN');
  if (rules.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) errors.push('Invalid IFSC code');
  if (rules.noXSS && detectXSS(value)) errors.push('Input contains potentially unsafe content');
  return { valid: errors.length === 0, errors };
}

/** 15A.3 — API Rate Limiting (Client-side) */
class RateLimiter {
  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  check(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    if (!this.requests.has(key)) this.requests.set(key, []);
    const timestamps = this.requests.get(key).filter(t => t > windowStart);
    this.requests.set(key, timestamps);
    if (timestamps.length >= this.maxRequests) {
      const retryAfter = Math.ceil((timestamps[0] + this.windowMs - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter, total: this.maxRequests };
    }
    timestamps.push(now);
    return { allowed: true, remaining: this.maxRequests - timestamps.length, retryAfter: 0, total: this.maxRequests };
  }

  reset(key = 'default') { this.requests.delete(key); }
  resetAll() { this.requests.clear(); }
}

export const apiLimiter = new RateLimiter(60, 60000);
export const authLimiter = new RateLimiter(5, 300000);
export const searchLimiter = new RateLimiter(30, 60000);

/** 15A.7 — CSP Header Configuration */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com', 'https://generativelanguage.googleapis.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https://openweathermap.org'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://generativelanguage.googleapis.com', 'https://api.openweathermap.org', 'https://api.data.gov.in'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
};

export function generateCSPHeader() {
  return Object.entries(CSP_POLICY).map(([key, values]) => `${key} ${values.join(' ')}`).join('; ');
}

/** 15A.8 — Secrets Audit */
export function auditSecrets() {
  const envVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_GEMINI_API_KEY', 'VITE_OPENWEATHER_KEY'];
  return envVars.map(key => ({
    key,
    exists: !!import.meta.env[key],
    length: (import.meta.env[key] || '').length,
    masked: import.meta.env[key] ? `${import.meta.env[key].slice(0, 6)}...${import.meta.env[key].slice(-4)}` : 'NOT SET',
  }));
}

export default { sanitizeInput, sanitizeObject, detectXSS, validateInput, apiLimiter, authLimiter, searchLimiter, generateCSPHeader, auditSecrets };
