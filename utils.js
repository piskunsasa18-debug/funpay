import process from 'node:process';

function readNumber(name, fallback, { min = Number.NEGATIVE_INFINITY } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(String(raw).replace(',', '.'));
  if (!Number.isFinite(value) || value < min) {
    throw new Error(`${name} must be a number >= ${min}`);
  }
  return value;
}

function readBool(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'y', 'on'].includes(String(raw).trim().toLowerCase());
}

function readString(name, fallback = '') {
  return process.env[name] === undefined ? fallback : String(process.env[name]).trim();
}

export const config = {
  telegramBotToken: readString('TELEGRAM_BOT_TOKEN'),
  telegramChatId: readString('TELEGRAM_CHAT_ID'),
  sourceUrl: readString('SOURCE_URL'),
  checkIntervalSeconds: readNumber('CHECK_INTERVAL_SECONDS', 60, { min: 15 }),
  thresholdRubPerKk: readNumber('THRESHOLD_RUB_PER_KK', 27, { min: 0 }),
  startupSuppressExisting: readBool('STARTUP_SUPPRESS_EXISTING', true),
  port: readNumber('PORT', 3000, { min: 1 }),
  fields: {
    lotsPath: readString('LOTS_PATH'),
    id: readString('ID_FIELD', 'id'),
    title: readString('TITLE_FIELD', 'title'),
    url: readString('URL_FIELD', 'url'),
    seller: readString('SELLER_FIELD', 'seller'),
    price: readString('PRICE_FIELD', 'price'),
    amount: readString('AMOUNT_FIELD', 'amount'),
    pricePerKk: readString('PRICE_PER_KK_FIELD')
  }
};

export function validateConfig() {
  const missing = [];
  if (!config.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!config.sourceUrl) missing.push('SOURCE_URL');

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
