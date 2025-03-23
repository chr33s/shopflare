import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/shopify.webhooks";

export async function action({ context, request }: Route.ActionArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("shopify.webhooks");

		const webhook = await shopify.webhook(request);
		shopify.utils.log.debug("shopify.webhooks", { ...webhook });

		const session = await shopify.session.get(webhook.domain);
		const payload = await request.json();

		switch (webhook.topic) {
			case "APP_UNINSTALLED":
				if (session) {
					await shopify.session.delete(session.id);
				}
				break;

			case "APP_SCOPES_UPDATE":
				if (session) {
					await shopify.session.set({
						...session,
						scope: (payload as { current: string[] }).current.toString(),
					});
				}
				break;
		}

		await context.cloudflare.env.WEBHOOK_QUEUE?.send(
			{
				payload,
				webhook,
			},
			{ contentType: "json" },
		);

		return new Response(undefined, { status: 204 });
		// biome-ignore lint/suspicious/noExplicitAny: catch(err)
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}
