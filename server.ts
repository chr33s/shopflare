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
