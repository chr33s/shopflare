# ShopFlare

> Minimalist Shopify app using React Router (v7) running on cloudflare (worker, kv, analytics). Only essential features, no future changes other than core upgrades & platform alignment.

## Rationale

- @shopify/shopify-[api,app-remix] to complex (to much abstraction)
- Needed a simple starter, than only does the basics
- Small code surface, easier audit
- Stability over feature completeness
- Minimally opinionated, by supporting only:
  1.  Embedded app use-case
  2.  New Embedded Auth Strategy
  3.  Managed Pricing

## Requirements

1. Cloudflare account
2. cloudflared cli `brew install cloudflared`
3. Node.js & NPM see package.json#engines `brew install node@22`
4. Github cli `brew install gh` (optional)

## Setup

```sh
npm install
cp .env.example .env 																							# update vars to match your env
# vi [wrangler.json, shopify.app.toml] 														# update vars[SHOPIFY_API_KEY, SHOPIFY_APP_URL]
npx wrangler secret put SHOPIFY_API_SECRET_KEY 										# value from shopify partners
gh secret set --app=actions CLOUDFLARE_API_TOKEN									# value from cloudflare
gh variable set SHOPIFY_API_KEY
```

## Development

```sh
npm run dev
# open -a Safari ${SHOPIFY_APP_URL}
```

## Production

```sh
npm run deploy
```

## Copyright

Copyright (c) 2025 chr33s. See LICENSE.md for further details.
