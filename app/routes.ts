import {type RouteConfig, index, prefix, route} from '@react-router/dev/routes';

export default [
	index('routes/index.tsx'),
	...prefix('app', [index('routes/app.tsx')]),
	// NOTE: route path must match proxy path ~ shopify.url/:subpathPrefix((a|apps|community|tools)/:subpath == proxy.url/:subpathPrefix/:subpath
	...prefix('apps/:subpath', [index('./routes/proxy.tsx')]),
	...prefix('shopify', [
		route('session-token-bounce', './routes/shopify.session-token-bounce.tsx'),
		route('webhooks/:target?', './routes/shopify.webhooks.$target.tsx'),
	]),
] satisfies RouteConfig;
