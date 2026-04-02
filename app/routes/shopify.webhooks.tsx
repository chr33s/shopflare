import { env } from "cloudflare:workers";
import { shopify } from "#app/shopify.server";
import type { Route } from "./+types/shopify.webhooks";

export async function action({ request }: Route.ActionArgs) {
	try {
		const { session, payload: webhook } = await shopify.authenticate.webhook(request);
		console.debug("routes/shopify.webhooks#action", webhook.webhookId);

		await env.WEBHOOK_QUEUE.send({ session, webhook }, { contentType: "json" });

		return new Response(undefined, { status: 204 });
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}
