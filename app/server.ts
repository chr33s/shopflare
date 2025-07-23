import {createRequestHandler} from 'react-router';

import {type QueueHandlerMessage, queueHandler} from '#app/queues';

const fetchHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		return fetchHandler(request, {
			cloudflare: {env, ctx},
		});
	},

	async queue(batch, env, ctx): Promise<void> {
		return queueHandler(batch, {
			cloudflare: {env, ctx},
		});
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from '#app/durable-objects';
export * from '#app/workflows';
