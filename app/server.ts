import {createRequestHandler} from 'react-router';

import {type QueueHandlerMessage, queueHandler} from '~/queues';

declare module 'react-router' {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: Env;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		if (await rateLimited(request, env)) {
			return new Response('Rate limit exceeded', {status: 429});
		}

		return requestHandler(request, {
			cloudflare: {env, ctx},
		});
	},

	async queue(batch, env, ctx): Promise<void> {
		return queueHandler(batch, {
			cloudflare: {env, ctx},
		});
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

async function rateLimited(request: Request, env: Env) {
	const url = new URL(request.url);
	const key =
		// shopify
		url.searchParams.get('shop') ??
		request.headers.get('x-Shopify-Shop-Domain') ??
		// cloudflare
		(request.cf?.hostMetadata as {customer_id: string}).customer_id ??
		request.headers.get('CF-Worker') ??
		// fallback
		'unknown';
	const {success} = await env.RATE_LIMITER.limit({key});
	return !success || key === 'unknown';
}

export * from '~/durable-objects';
export * from '~/services';
export * from '~/workflows';
