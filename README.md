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
2. cloudflared cli `brew install cloudflared` (optional, if `--use-localhost`) [1]
3. Node.js & NPM see package.json#engines `brew install node@22`
4. Github cli `brew install gh` (optional)

[1] In-order to wss:// working on a cloudflare tunnel, you need to set "Additional application settings" > "HTTP Settings" > "HTTP Host Header" to match the service URL (e.g. 127.0.0.1), otherwise the tunnel returns a 502 http status & client connection fails

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
npm run dev             # or npm run dev:shopify -- --use-localhost
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
- [Polaris](https://polaris.shopify.com)
- [React](https://react.dev/reference/react)
- [React Router](https://reactrouter.com/home)
- [Shopify](http://shopify.dev/)

### createShopify

```js
export async function loader({ context, request }) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("message...");                                     // Log on [error, info, debug]
	const client = await shopify.admin(request);                               // Authenticate on [admin*, proxy*, webhook] [*] returns a client
  const { data, errors } = await client.request(`query { shop { name } }`);
  shopify.redirect(request, url, { shop });
}
```

### Components

#### [app-bridge.tsx](./app/components/app-bridge.tsx) 

Follow App Bridge docs but import `~/components/polaris` instead of `@shopify/polaris`

#### [polaris.tsx](./app/components/polaris.tsx)

Follow Polaris docs but import `~/components/app-bridge` instead of `@shopify/app-bridge-react` and take note that:

- Checkbox
- RadioButton
- Select
- TextField

no longer require `onChange` & `value` (as these are now uncontrolled) but requires a `name` prop now.

#### [proxy.tsx](./app/components/proxy.tsx)

Follow [Shopify App Proxy](https://shopify.dev/docs/api/shopify-app-remix/v3/app-proxy-components) docs but import from `~/components/proxy` instead of `@shopify/shopify-app-remix/react`

### Branching convention

- `issue/#` references an current issue / pull-request
- `extension/#` is a non core feature extension

## Copyright

Copyright (c) 2025 chr33s. See LICENSE.md for further details.
