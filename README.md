# ShopFlare

> Shopify app running on cloudflare pages

## Requirements

1. Cloudflare account
2. cloudflared cli `brew install cloudflared`
3. Node.js & NPM see package.json#engines `brew install node@18`
4. Actionlint `brew install actionlint`

## Setup

```sh
npx wrangler pages project create {project-name}

cp .env .env.local # update values
export $(cat .env.local | xargs)
```

- copy .env.cloudflare vars to Cloudflare pages > Environment variables
- create Workers > KV store key SHOPFLARE_KV & attach it to pages > Settings > KV namespace bindings
- copy .env.github vars to Github > secrets and variables

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

## Changelog

- https://github.com/Shopify/shopify-api-js/compare/main..2e01ac6
- https://github.com/Shopify/shopify-app-js/compare/main..2444643

## Documentation

| Method(s) | URL                           |
| --------- | ----------------------------- |
| GET       | /api/auth/callback?           |
| POST      | /api/proxy/graphql/admin      |
| POST      | /api/proxy/graphql/storefront |
| ALL       | /api/proxy/rest/:path         |
| POST      | /api/graphql                  |

## Copyright

Copyright (c) 2023 chr33s. See LICENSE.md for further details.
