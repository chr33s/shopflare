import type { Route } from "./+types/shopify.webhooks";
import { createShopify } from "~/shopify.server";

export async function action({ context, request }: Route.ActionArgs) {
	const shopify = createShopify(context);
	const webhook = await shopify.api.webhooks.process({
		context: context,
		rawBody: await request.text(),
		rawRequest: request,
	});
	console.log({ ...webhook });

	if (!webhook.admin && webhook.topic !== "SHOP_REDACT") {
		// The admin context isn't returned if the webhook fired after a shop was uninstalled.
		throw new Response();
	}

	switch (webhook.topic) {
		// app
		case "APP_UNINSTALLED": {
			if (!webhook.session) {
				break;
			}

			await shopify.session.delete(webhook.session.id);

			break;
		}

		case "APP_PURCHASES_ONE_TIME_UPDATE":
		case "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT":
		case "APP_SUBSCRIPTIONS_UPDATE":
			break;

		// compliance
		case "CUSTOMERS_DATA_REQUEST":
		case "CUSTOMERS_REDACT":
		case "SHOP_REDACT":
			break;
	}

	throw new Response();
}
