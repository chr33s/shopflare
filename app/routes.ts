import {
	index,
	layout,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	...prefix('app', [
		layout('./routes/app.tsx', [index('routes/app.index.tsx')]),
	]),
	// NOTE: route path must match proxy path ~ shopify.url/:subpathPrefix((a|apps|community|tools)/:subpath == proxy.url/:subpathPrefix/:subpath
	...prefix('apps/:subpath', [
		layout('./routes/proxy.tsx', [index('./routes/proxy.index.tsx')]),
	]),
	...prefix('shopify', [
		route('session-token-bounce', './routes/shopify.session-token-bounce.tsx'),
		route('webhooks', './routes/shopify.webhooks.tsx'),
	]),
] satisfies RouteConfig;
