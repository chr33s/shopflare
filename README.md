# ShopFlare

Minimalist Shopify app using React Router (v7) running on cloudflare (worker, kv, queues). Only essential features, no future changes other than core upgrades & platform alignment.

## Assumptions

Familiarity with React, ReactRouter, Cloudflare, Shopify conventions.

## Requirements

1. Cloudflare account
2. Shopify Partner account
3. Node.js & NPM see package.json#engines `brew install node@22`
4. cloudflared cli `brew install cloudflared` (optional)
5. Github cli `brew install gh` (optional)

> [!NOTE]
>
> - For wss:// to work on a cloudflare tunnel, you need to set "Additional application settings" > "HTTP Settings" > "HTTP Host Header" to match the service URL (e.g. 127.0.0.1), otherwise the tunnel returns a 502 http status & client connection fails
> - To bypass caching set: Caching > Cache Rules ["Rule Name" = "bypass cache on tunnel", "Custom filter expression" = "", Field = Hostname, Operator = equals, Value = tunnel url, "Cache eligibility" = "Bypass cache", "Browser TTL" = "Bypass cache" ]

## Setup

```sh
npm install
cp .env.example .env                                    # update vars to match your env values from partners.shopify.com (Apps > All Apps > Create App)
# vi [wrangler.json, shopify.app.toml]                  # update vars[SHOPIFY_API_KEY, SHOPIFY_APP_URL], SHOPIFY_APP_URL is the cloudflare tunnel url (e.g. https://shopflare.trycloudflare.com) in development and the cloudflare worker url (e.g. https://shopflare.workers.dev) in other environments.
npx wrangler secret put SHOPIFY_API_SECRET
npx wrangler kv namespace create shopflare              # update wranglers.json#kv_namespaces[0].id
gh secret set --app=actions CLOUDFLARE_API_TOKEN        # value from dash.cloudflare.com (Manage Account > Account API Tokens > Create Token)
gh secret set --app=actions SHOPIFY_CLI_PARTNERS_TOKEN  # value from partners.shopify.com (Settings > CLI Token > Manage Tokens > Generate Token)
gh variable set SHOPIFY_API_KEY
```

### Cloudflare tunnel

see: https://github.com/eastlondoner/vite-plugin-cloudflare-tunnel

## Development

```sh
npm run deploy:shopify  # only required on setup or config changes
npm run gen
npm run dev             # or npm run dev:shopify:tunnel
# open -a Safari ${SHOPIFY_APP_URL}
```

## Production

```sh
npm run build
npm run deploy
```

To split environments see [Cloudflare](https://developers.cloudflare.com/workers/wrangler/environments/) and [Shopify](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration) docs.

## Documentation

- [App Bridge](https://shopify.dev/docs/api/app-bridge-library/react-components)
- [Cloudflare](https://developers.cloudflare.com)
- [Polaris Web components](https://shopify.dev/docs/api/app-home/web-components)
- [Polaris Storybook](https://storybook.polaris-admin.shopify.dev/)
- [React](https://react.dev/reference/react)
- [React Router](https://reactrouter.com/)
- [Shopify](http://shopify.dev/)

### Usage

see: https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/shopify-app-react-router

### Branching convention

- `issue/#` references an current issue / pull-request
- `extension/#` is a non core feature extension

## Copyright

Copyright (c) 2026 chr33s. See license for further details.
