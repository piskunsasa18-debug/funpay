import { escapeHtml } from './utils.js';

export class TelegramClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.offset = 0;
    this.polling = false;
  }

  async request(method, payload = {}) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.ok === false) {
      throw new Error(`Telegram ${method} failed: ${json.description || response.status}`);
    }
    return json.result;
  }

  async sendMessage(chatId, text, options = {}) {
    if (!chatId) return null;
    return this.request('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    });
  }

  async getUpdates() {
    return this.request('getUpdates', {
      offset: this.offset,
      timeout: 25,
      allowed_updates: ['message']
    });
  }

  async startPolling(onCommand) {
    if (this.polling) return;
    this.polling = true;

    while (this.polling) {
      try {
        const updates = await this.getUpdates();
        for (const update of updates) {
          this.offset = Math.max(this.offset, update.update_id + 1);
          const message = update.message;
          if (!message || !message.text) continue;
          const text = message.text.trim();
          if (!text.startsWith('/')) continue;
          await onCommand({
            command: text.split(/\s+/)[0].split('@')[0].toLowerCase(),
            text,
            chatId: message.chat.id,
            from: message.from,
            message
          });
        }
      } catch (error) {
        console.error('[telegram] polling error:', error.message);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  stopPolling() {
    this.polling = false;
  }
}

export function formatLotAlert(lot, threshold) {
  const lines = [
    '🚨 <b>Найден дешёвый лот Black Russia</b>',
    '',
    `<b>Цена:</b> ${escapeHtml(lot.rubPerKk)} ₽ за 1кк`,
    `<b>Порог:</b> меньше ${escapeHtml(threshold)} ₽ за 1кк`,
    lot.priceRub !== null ? `<b>Общая цена:</b> ${escapeHtml(lot.priceRub)} ₽` : null,
    lot.amountKk !== null ? `<b>Количество:</b> ${escapeHtml(lot.amountKk)}кк` : null,
    `<b>Название:</b> ${escapeHtml(lot.title)}`,
    lot.seller ? `<b>Продавец:</b> ${escapeHtml(lot.seller)}` : null,
    lot.url ? `<b>Ссылка:</b> ${escapeHtml(lot.url)}` : null
  ].filter(Boolean);

  return lines.join('\n');
}
