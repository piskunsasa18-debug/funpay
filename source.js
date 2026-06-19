export function getByPath(object, path) {
  if (!path) return object;
  return path.split('.').filter(Boolean).reduce((current, part) => {
    if (current == null) return undefined;
    return current[part];
  }, object);
}

export function stableString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function parseNumberLike(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const raw = stableString(value)
    .replace(/\s+/g, '')
    .replace(/₽|руб\.?|rub|rur/gi, '')
    .replace(',', '.');
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  if (!match) return NaN;
  return Number(match[0]);
}

export function parsePriceRub(value) {
  return parseNumberLike(value);
}

export function parseMillions(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return NaN;
    // Values above 100000 are usually raw virts. Convert to millions.
    return value >= 100000 ? value / 1000000 : value;
  }

  const raw = stableString(value).toLowerCase().replace(',', '.');
  const numeric = parseNumberLike(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) return NaN;

  if (/(кк|kk|million|millions|млн|m\b)/i.test(raw)) return numeric;
  if (/(к|k\b)/i.test(raw)) return numeric / 1000;

  // Plain large numbers are treated as raw virts, small numbers as millions.
  return numeric >= 100000 ? numeric / 1000000 : numeric;
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function escapeHtml(value) {
  return stableString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
