import type { Env } from "@/functions/types";
import {
	config,
	deleteSessionsFromStorage,
	getSessionFromStorage,
	shopify,
} from "@/lib/shopify";

export const onRequestPost: PagesFunction<Env> = async (context) => {
	try {
		const id = context.request.headers.get("X-Shopify-Webhook-Id");
		const rawBody = await context.request.text();
		const shop = context.request.headers.get("X-Shopify-Shop-Domain");
		if (!shop) {
			throw Error("no shop");
		}
		const topic = context.request.headers.get("X-Shopify-Topic");

		const { reason, valid }: any = await shopify(context).webhooks.validate({
			rawBody,
			rawRequest: context.request,
		});
		if (!valid) {
			shopify(context).logger.info("Invalid webhook call, not handling it", {
				body: JSON.parse(rawBody),
				id,
				reason,
				shop,
				topic,
			});
			throw Error("invalid hmac");
		}

		const sessionId = shopify(context).session.getOfflineId(shop);
		const session = await getSessionFromStorage(context, sessionId);
		if (!session) {
			throw Error("no valid session");
		}

		switch (topic) {
			// NOTE: https://shopify.dev/docs/api/admin-rest/2023-04/resources/webhook#event-topics
			case "customers/data_request":
			case "customers/redact":
			case "shop/redact":
				// TODO not storing any PI
				break;
			case "app/uninstalled":
				const subscriptions = await shopify(context).billing.subscriptions({
					session,
				});
				await Promise.all(
					(subscriptions as any).map((subscription: any) =>
						shopify(context).billing.cancel({
							prorate: config.billingProrate,
							session,
							subscriptionId: subscription.id,
						}),
					),
				);

				await deleteSessionsFromStorage(context, shop);
				break;
		}

		return new Response("ok", { status: 200 });
	} catch (error: any) {
		return new Response("nok", { status: 500 });
	}
};
