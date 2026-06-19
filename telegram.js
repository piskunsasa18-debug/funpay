import { getByPath, parseMillions, parseNumberLike, parsePriceRub, round2, stableString } from './utils.js';

function normalizeLot(raw, fields) {
  const idRaw = getByPath(raw, fields.id);
  const title = stableString(getByPath(raw, fields.title)) || 'Lot';
  const url = stableString(getByPath(raw, fields.url));
  const seller = stableString(getByPath(raw, fields.seller));

  let priceRub = NaN;
  let amountKk = NaN;
  let rubPerKk = NaN;

  if (fields.pricePerKk) {
    rubPerKk = parseNumberLike(getByPath(raw, fields.pricePerKk));
  }

  if (!Number.isFinite(rubPerKk)) {
    priceRub = parsePriceRub(getByPath(raw, fields.price));
    amountKk = parseMillions(getByPath(raw, fields.amount));
    if (Number.isFinite(priceRub) && Number.isFinite(amountKk) && amountKk > 0) {
      rubPerKk = priceRub / amountKk;
    }
  } else {
    priceRub = parsePriceRub(getByPath(raw, fields.price));
    amountKk = parseMillions(getByPath(raw, fields.amount));
  }

  const id = stableString(idRaw) || stableString(url) || `${title}|${seller}|${priceRub}|${amountKk}|${rubPerKk}`;

  return {
    id,
    title,
    url,
    seller,
    priceRub: Number.isFinite(priceRub) ? round2(priceRub) : null,
    amountKk: Number.isFinite(amountKk) ? round2(amountKk) : null,
    rubPerKk: Number.isFinite(rubPerKk) ? round2(rubPerKk) : null,
    raw
  };
}

export async function fetchLots(config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(config.sourceUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'user-agent': 'BlackRussiaVirtyTelegramMonitor/1.0'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`SOURCE_URL responded with HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      // Some APIs return JSON with a generic content type. Try parsing anyway.
      const text = await response.text();
      return parseJsonLots(JSON.parse(text), config.fields);
    }

    const json = await response.json();
    return parseJsonLots(json, config.fields);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseJsonLots(json, fields) {
  const container = getByPath(json, fields.lotsPath);
  const array = Array.isArray(container) ? container : Array.isArray(json) ? json : [];

  if (!Array.isArray(array)) {
    throw new Error(`LOTS_PATH does not point to an array: ${fields.lotsPath || '<root>'}`);
  }

  return array
    .map((item) => normalizeLot(item, fields))
    .filter((lot) => lot.rubPerKk !== null && Number.isFinite(lot.rubPerKk));
}
