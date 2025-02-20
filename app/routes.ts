import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	layout("routes/app.tsx", [
    route("app", "routes/app.index.tsx"),
  ]),
  layout("routes/proxy.tsx", [
    route("apps/shopflare", "routes/proxy.index.tsx"), // NOTE: route path must match proxy path
  ]),
  route("shopify/auth/login", "routes/shopify.auth.login.tsx"),
  route("shopify/auth/session-token-bounce", "routes/shopify.auth.session-token-bounce.tsx"),
  route("shopify/webhooks", "routes/shopify.webhooks.tsx"),
] satisfies RouteConfig;
