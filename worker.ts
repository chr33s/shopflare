import { withSentry } from "@sentry/cloudflare";
import { createRequestHandler } from "react-router";

import type { WebhookQueueMessage } from "~/types/app";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: Env;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default withSentry((env) => ({ dsn: (env as Env).SENTRY_DSN }), {
	async fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},

	async queue(batch, _env, _ctx): Promise<void> {
		console.log(`server.queue: ${JSON.stringify(batch.messages)}`);

		for (const message of batch.messages) {
			message.ack();
		}
	},
} satisfies ExportedHandler<Env, WebhookQueueMessage>);
