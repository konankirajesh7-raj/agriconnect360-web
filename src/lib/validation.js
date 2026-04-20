/**
 * Data Validation — Phase 8C
 * Input validation schemas for all Supabase table writes
 * Lightweight validation without external deps (no Zod needed for client)
 */

// ── Validation Helpers ────────────────────────────────────────────────────────

function isString(v, min = 0, max = 500) {
  return typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
}

function isNumber(v, min = -Infinity, max = Infinity) {
  const n = parseFloat(v);
  return !isNaN(n) && n >= min && n <= max;
}

function isPhone(v) {
  return /^[6-9]\d{9}$/.test(v?.replace(/[\s+-]/g, '').slice(-10));
}

function isDate(v) {
  return !isNaN(new Date(v).getTime());
}

function isUUID(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function isIn(v, options) {
  return options.includes(v);
}

function validate(data, rules) {
  const errors = [];
  for (const [field, checks] of Object.entries(rules)) {
    const value = data[field];
    for (const check of checks) {
      const result = check(value, field);
      if (result) errors.push(result);
    }
  }
  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] };
}

// ── Required check ───────────────────────────────────────────────────────────

const required = (v, field) => (v === undefined || v === null || v === '') ? `${field} is required` : null;
const optionalString = () => null; // Always passes

// ── Schemas ──────────────────────────────────────────────────────────────────

export const schemas = {
  farmer: {
    name: [required, (v, f) => !isString(v, 2, 100) ? `${f} must be 2-100 characters` : null],
    mobile: [required, (v, f) => !isPhone(v) ? `${f} must be a valid 10-digit Indian mobile` : null],
    district: [required, (v, f) => !isString(v, 2, 50) ? `${f} must be a valid district name` : null],
  },

  field: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    name: [required, (v, f) => !isString(v, 1, 100) ? `${f} must be 1-100 characters` : null],
    area_acres: [(v, f) => v !== undefined && !isNumber(v, 0.01, 10000) ? `${f} must be 0.01-10000 acres` : null],
  },

  crop: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    crop_name: [required, (v, f) => !isString(v, 1, 100) ? `${f} must be 1-100 characters` : null],
  },

  expense: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    category: [required, (v, f) => !isString(v, 1, 50) ? `${f} must be 1-50 characters` : null],
    amount: [required, (v, f) => !isNumber(v, 0.01, 99999999) ? `${f} must be ₹0.01 - ₹9,99,99,999` : null],
  },

  sale: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    crop: [required, (v, f) => !isString(v, 1, 100) ? `${f} is required` : null],
    quantity_kg: [(v, f) => v !== undefined && !isNumber(v, 0.1, 999999) ? `${f} must be 0.1-999999 kg` : null],
    price_per_kg: [(v, f) => v !== undefined && !isNumber(v, 0.01, 99999) ? `${f} must be valid` : null],
  },

  labour_booking: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    task_type: [required, (v, f) => !isString(v, 1, 100) ? `${f} is required` : null],
    workers_needed: [(v, f) => v !== undefined && !isNumber(v, 1, 500) ? `${f} must be 1-500` : null],
  },

  transport_booking: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    origin: [required, (v, f) => !isString(v, 1, 200) ? `${f} is required` : null],
    destination: [required, (v, f) => !isString(v, 1, 200) ? `${f} is required` : null],
  },

  equipment_booking: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    equipment_type: [required, (v, f) => !isString(v, 1, 100) ? `${f} is required` : null],
  },

  dispute: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    type: [required, (v, f) => !isString(v, 1, 50) ? `${f} is required` : null],
    against: [required, (v, f) => !isString(v, 1, 200) ? `${f} is required` : null],
    description: [required, (v, f) => !isString(v, 10, 2000) ? `${f} must be 10-2000 characters` : null],
  },

  community_post: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    content: [required, (v, f) => !isString(v, 1, 5000) ? `${f} must be 1-5000 characters` : null],
  },

  wallet_transaction: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    type: [required, (v, f) => !isIn(v, ['credit', 'debit', 'reward', 'refund']) ? `${f} must be credit/debit/reward/refund` : null],
    amount: [required, (v, f) => !isNumber(v, 0.01, 9999999) ? `${f} must be valid` : null],
  },

  scheme_application: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    scheme_name: [required, (v, f) => !isString(v, 1, 200) ? `${f} is required` : null],
  },

  notification: {
    farmer_id: [required, (v, f) => !isUUID(v) ? `${f} must be a valid ID` : null],
    type: [required, (v, f) => !isString(v, 1, 50) ? `${f} is required` : null],
    title: [required, (v, f) => !isString(v, 1, 200) ? `${f} is required` : null],
  },
};

/**
 * Validate input data against a schema
 * @param {string} schemaName - Name of the schema (e.g., 'farmer', 'expense')
 * @param {object} data - Data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateInput(schemaName, data) {
  const schema = schemas[schemaName];
  if (!schema) return { valid: true, errors: [] }; // No schema = pass through
  return validate(data, schema);
}

/**
 * Sanitize string input — strip HTML/scripts
 */
export function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')        // Strip HTML tags
    .replace(/javascript:/gi, '')    // Remove JS protocol
    .replace(/on\w+=/gi, '')         // Remove event handlers
    .trim();
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitize(value) : value;
  }
  return result;
}

export default { validateInput, sanitize, sanitizeObject, schemas };
