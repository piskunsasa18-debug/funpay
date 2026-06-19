# Black Russia Virty Telegram Monitor

Telegram bot for monitoring public Black Russia virty lots and sending an alert when a lot is cheaper than the configured threshold, for example less than `27` rubles per `1kk`.

This template is intentionally notification-only. Do not use it to bypass website protections, scrape prohibited pages, automate purchases, or access accounts without permission. Use only a public API/JSON feed or a source that explicitly permits automated access.

## What it does

- Checks `SOURCE_URL` on a timer.
- Parses lots from JSON.
- Calculates rubles per `1kk`.
- Sends Telegram alerts when `rub/1kk < THRESHOLD_RUB_PER_KK`.
- Supports `/start`, `/id`, `/status`, `/check` commands.
- Includes a Railway health endpoint at `/healthz`.

## Expected source format

Best case: your source returns JSON like this:

```json
{
  "items": [
    {
      "id": "lot-123",
      "title": "Black Russia virty 10kk",
      "price": "260 ₽",
      "amount": "10kk",
      "seller": "seller-name",
      "url": "https://example.com/lot/123"
    }
  ]
}
```

For this example, use:

```env
LOTS_PATH=items
ID_FIELD=id
TITLE_FIELD=title
URL_FIELD=url
SELLER_FIELD=seller
PRICE_FIELD=price
AMOUNT_FIELD=amount
```

If your JSON is already an array, leave `LOTS_PATH` empty.

If your source already gives price per 1kk, set `PRICE_PER_KK_FIELD`, for example:

```env
PRICE_PER_KK_FIELD=pricePerKk
```

## Local setup

1. Create a bot in Telegram through BotFather and copy the token.
2. Copy `.env.example` to `.env`.
3. Fill `TELEGRAM_BOT_TOKEN` and `SOURCE_URL`.
4. Run:

```bash
npm install
npm start
```

5. Open Telegram, send `/start` to your bot, then send `/id`.
6. Copy the returned chat ID into `TELEGRAM_CHAT_ID`.
7. Restart the app.

## Railway deploy through GitHub

1. Create a GitHub repository and push this project.
2. In Railway, create a new project from the GitHub repository.
3. Railway will detect the Node.js app and use `npm start` from `railway.json`.
4. Add these variables in Railway service variables:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
SOURCE_URL=...
CHECK_INTERVAL_SECONDS=60
THRESHOLD_RUB_PER_KK=27
STARTUP_SUPPRESS_EXISTING=true
LOTS_PATH=items
ID_FIELD=id
TITLE_FIELD=title
URL_FIELD=url
SELLER_FIELD=seller
PRICE_FIELD=price
AMOUNT_FIELD=amount
PRICE_PER_KK_FIELD=
```

5. Deploy. Check logs. The bot should answer `/status` and `/check`.

## Important variables

| Variable | Meaning |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather. Required. |
| `TELEGRAM_CHAT_ID` | Chat/user/group ID for alerts. Recommended. |
| `SOURCE_URL` | Public JSON/API URL with lots. Required. |
| `THRESHOLD_RUB_PER_KK` | Alert threshold. Default: `27`. |
| `CHECK_INTERVAL_SECONDS` | Check interval. Default: `60`. |
| `STARTUP_SUPPRESS_EXISTING` | If `true`, existing cheap lots are marked as seen on startup to avoid initial spam. |
| `LOTS_PATH` | Dot-path to the lots array inside JSON, e.g. `data.items`. Empty means the root JSON is the array. |
| `PRICE_FIELD` | Field containing total price in rubles. |
| `AMOUNT_FIELD` | Field containing amount of virts, e.g. `10kk`, `10кк`, `10000000`. |
| `PRICE_PER_KK_FIELD` | Optional field containing rubles per 1kk directly. |

## Commands

- `/start` - basic help.
- `/id` - returns current Telegram chat ID.
- `/status` - returns current bot settings.
- `/check` - runs one manual check.

## Notes about amount parsing

The parser understands common values such as:

- `10kk`, `10кк`, `10 кк`
- `1.5kk`, `1,5кк`
- `10000000`
- `10 million`, `10 млн`

## Troubleshooting

If no alerts are sent:

1. Send `/status` to the bot.
2. Check that `SOURCE_URL` returns valid JSON.
3. Check that `LOTS_PATH` points to the array of lots.
4. Check that `PRICE_FIELD` and `AMOUNT_FIELD` match the JSON fields.
5. Send `/check` and inspect Railway logs.

If Telegram commands do not work, make sure there is only one running copy of the bot using the same token. Telegram long polling can conflict if several instances use the same token.
