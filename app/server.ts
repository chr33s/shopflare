import {createRequestHandler} from 'react-router';

import {queueHandler, type QueueHandlerMessage} from '#app/queues';

const fetchHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		return fetchHandler(request, {
			cloudflare: {ctx, env},
		});
	},

	async queue(batch, env, ctx): Promise<void> {
		return queueHandler(batch, {
			cloudflare: {ctx, env},
		});
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from '#app/durable-objects';
