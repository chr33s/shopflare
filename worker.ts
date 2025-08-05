import * as Sentry from "@sentry/cloudflare";
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

export default Sentry.withSentry(
	(env: Env) => ({
		dsn: env.SENTRY_DSN,
		environment: env.SHOPIFY_APP_ENV,
		release: env.CF_VERSION_METADATA.id,
	}),
	{
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
	} satisfies ExportedHandler<Env, WebhookQueueMessage>,
);
