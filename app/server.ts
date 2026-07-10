import { createRequestHandler, RouterContextProvider } from "react-router";

import { queueHandler, type QueueHandlerMessage } from "#app/queues";

const fetchHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const context = new RouterContextProvider();
		context.cloudflare = { ctx, env };
		return fetchHandler(request, context);
	},

	async queue(batch): Promise<void> {
		return queueHandler(batch);
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from "#app/durable-objects";
