import { createRequestHandler } from "react-router";

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

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const { success } = await env.RATE_LIMITER.limit({
			key:
				url.searchParams.get("shop") ??
				request.headers.get("cf-connecting-ip") ??
				"unknown",
		});
		if (!success) {
			return new Response(`429 Failure – rate limit exceeded`, { status: 429 });
		}

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
} satisfies ExportedHandler<Env>;
