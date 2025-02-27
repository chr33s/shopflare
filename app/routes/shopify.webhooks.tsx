import type { Route } from "./+types/shopify.webhooks";
import { createShopify } from "~/shopify.server";

export async function action({ context, request }: Route.ActionArgs) {
	try {
		const shopify = createShopify(context);
		shopify.utils.log.debug("shopify.webhooks");

		const webhook = await shopify.webhook(request);
		shopify.utils.log.debug("shopify.webhooks", { ...webhook });

		const session = await shopify.session.get(webhook.domain);

		switch (webhook.topic) {
			// app
			case "APP_UNINSTALLED": {
				if (!session) {
					break;
				}
				await shopify.session.delete(session.id);

				break;
			}
			case "APP_PURCHASES_ONE_TIME_UPDATE":
			case "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT":
			case "APP_SUBSCRIPTIONS_UPDATE":

			// compliance
			case "CUSTOMERS_DATA_REQUEST": // eslint-disable-line no-fallthrough
			case "CUSTOMERS_REDACT":
			case "SHOP_REDACT":
				break;
		}

		return new Response(undefined, { status: 204 });
	} catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
		return new Response(error.message, {
			status: error.status,
			statusText: "Unauthorized",
		});
	}
}
