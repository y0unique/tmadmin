// ── Sanitization utility ──────────────────────────────────────────────────────
// Used on both frontend (ItemModal) and backend (API routes)

const HTML_TAGS  = /<[^>]*>/g;
const SCRIPT_TAG = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const SQL_INJECT = /(['";\\]|--|\bOR\b|\bAND\b|\bDROP\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b)/gi;
const DANGEROUS  = /[<>]/g;

/**
 * Sanitize a single string value
 * Returns { value, wasCleaned, reason }
 */
export function sanitizeString(input, opts = {}) {
  if (input === null || input === undefined) return { value: '', wasCleaned: false };
  
  let val = String(input);
  let wasCleaned = false;
  let reason = '';

  // Trim whitespace
  const trimmed = val.trim();
  if (trimmed !== val) { val = trimmed; wasCleaned = true; }

  // Detect and strip script tags
  if (SCRIPT_TAG.test(val)) {
    val = val.replace(SCRIPT_TAG, '');
    wasCleaned = true;
    reason = 'Script tags were removed.';
  }

  // Detect and strip HTML tags
  if (HTML_TAGS.test(val)) {
    val = val.replace(HTML_TAGS, '');
    wasCleaned = true;
    reason = reason || 'HTML tags were removed.';
  }

  // Detect dangerous characters
  if (DANGEROUS.test(val)) {
    val = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    wasCleaned = true;
    reason = reason || 'Special characters were escaped.';
  }

  // Detect suspicious SQL-like patterns (warn only, don't strip)
  if (!opts.allowSQL && SQL_INJECT.test(val)) {
    reason = reason || 'Suspicious input detected.';
    return { value: val, wasCleaned: true, reason, blocked: true };
  }

  return { value: val, wasCleaned, reason };
}

/**
 * Sanitize all text fields of a form object
 * Returns { sanitized, warnings, blocked }
 */
export function sanitizeForm(form) {
  const TEXT_FIELDS = [
    'item_name', 'item_title', 'item_description',
    'item_location', 'item_image',
  ];

  const sanitized = { ...form };
  const warnings  = [];
  let   blocked   = false;

  for (const field of TEXT_FIELDS) {
    if (!(field in form)) continue;
    const result = sanitizeString(form[field]);
    sanitized[field] = result.value;
    if (result.wasCleaned && result.reason) {
      warnings.push({ field, reason: result.reason });
    }
    if (result.blocked) blocked = true;
  }

  // Numeric fields — strip non-numeric chars
  for (const field of ['item_acqprice', 'item_srp', 'item_quantity']) {
    if (!(field in form)) continue;
    const val = String(form[field]).replace(/[^0-9.]/g, '');
    sanitized[field] = val;
  }

  return { sanitized, warnings, blocked };
}

/**
 * Backend sanitizer — for API route use
 * Strips HTML, trims, escapes dangerous chars
 */
export function sanitizeBackend(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(SCRIPT_TAG, '')
    .replace(HTML_TAGS, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
