import {createRequestHandler} from 'react-router';

import {type QueueHandlerMessage, queueHandler} from '#app/queues';

declare module 'cloudflare:test' {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-object-type
	interface ProvidedEnv extends Env {}
}

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

export * from '#app/durable-objects';
export * from '#app/workflows';
