import { createRequestHandler } from "react-router";

declare global {
	interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			ctx: ExecutionContext;
			env: CloudflareEnvironment;
		};
	}
}

const requestHandler = createRequestHandler(
	// @ts-expect-error - virtual module provided by React Router at build time
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request, env, ctx) {
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
} satisfies ExportedHandler<CloudflareEnvironment>;
