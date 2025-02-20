# ShopFlare

> Shopify app using React Router (v7) running on cloudflare worker

## Rationale

- @shopify/shopify-app-remix to complex (to much abstraction)
- Needed simple boilerplate, than only does the basics with minimal abstraction
- Minimally opinionated, by supporting only:
  1.  Embedded app use-case
  2.  New Embedded Auth Strategy
  3.  Managed Pricing

## Requirements

1. Cloudflare account
2. cloudflared cli `brew install cloudflared`
3. Node.js & NPM see package.json#engines `brew install node@22`
4. Actionlint `brew install actionlint`

## Setup

```sh
cp .env.example .env # update values
```

- copy .env.example vars to Cloudflare workers > Environment variables
- create Workers > KV store key \_SESSION_STORAGE & attach it to workers > Settings > KV namespace bindings
- copy .env{ SHOPIFY_API_KEY, CLOUDFLARE_API_TOKEN } vars to Github > secrets (and variables)

## Development

```sh
npm install
npm run dev
# open -a Safari {cloudflared.url}
```

## Production

```sh
npm run build
npm run deploy
```

## Copyright

Copyright (c) 2025 chr33s. See LICENSE.md for further details.
