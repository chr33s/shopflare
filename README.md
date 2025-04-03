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

## Assumptions

Familiarity with React, ReactRouter, Cloudflare, Shopify conventions.

## Requirements

1. Cloudflare account
2. cloudflared cli `brew install cloudflared`
3. Node.js & NPM see package.json#engines `brew install node@22`
4. Github cli `brew install gh` (optional)

## Setup

```sh
npm install
cp .env.example .env                                    # update vars to match your env values from partners.shopify.com (Apps > All Apps > Create App)
# vi [wrangler.json, shopify.app.toml]                  # update vars[SHOPIFY_API_KEY, SHOPIFY_APP_URL], SHOPIFY_APP_URL is the cloudflare tunnel url (e.g. https://shopflare.trycloudflare.com) in development and the cloudflare worker url (e.g. https://shopflare.workers.dev) in other environments.
npx wrangler secret put SHOPIFY_API_SECRET_KEY
npx wrangler kv namespace create shopflare              # update wranglers.json#kv_namespaces[0].id 
gh secret set --app=actions CLOUDFLARE_API_TOKEN        # value from dash.cloudflare.com (Manage Account > Account API Tokens > Create Token)
gh secret set --app=actions SHOPIFY_CLI_PARTNERS_TOKEN  # value from partners.shopify.com (Settings > CLI Token > Manage Tokens > Generate Token)
gh variable set SHOPIFY_API_KEY
```

## Development

```sh
# vi .env               # update vars[SHOPIFY_APP_LOG_LEVEL] sets logging verbosity.
npm run deploy:shopify  # only required on setup or config changes
npm run gen
npm run dev
# open -a Safari ${SHOPIFY_APP_URL}
```

## Production

```sh
npm run build
npm run deploy
```

To split environments see [Cloudflare](https://developers.cloudflare.com/workers/wrangler/environments/) and [Shopify](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration) docs.

## Documentation

- [React](https://react.dev/reference/react)
- [React Router](https://reactrouter.com/home)
- [Shopify](http://shopify.dev/)
- [Cloudflare](https://developers.cloudflare.com)

## Copyright

Copyright (c) 2025 chr33s. See LICENSE.md for further details.
