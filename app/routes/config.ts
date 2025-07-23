'use server-entry';

import type {unstable_RSCRouteConfig as RSCRouteConfig} from 'react-router';

export const routes = [
	{
		id: 'root',
		path: '',
		lazy: () => import('./layout'),
		children: [
			{
				id: 'index',
				index: true,
				lazy: () => import('./index'),
			},
			{
				id: 'app',
				path: 'app',
				lazy: () => import('./app.index'),
			},
			{
				id: 'proxy',
				path: 'apps/:subpath',
				lazy: () => import('./proxy.index'),
			},
		],
	},
	{
		id: 'shopify',
		path: 'shopify',
		children: [
			{
				id: 'shopify.session-token-bounce',
				path: 'session-token-bounce',
				lazy: () => import('./shopify.session-token-bounce'),
			},
			{
				id: 'shopify.webhooks-$target',
				path: 'webhooks/:target?',
				lazy: () => import('./shopify.webhooks.$target'),
			},
		],
	},
] satisfies RSCRouteConfig;
