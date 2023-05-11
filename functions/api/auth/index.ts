import { config, shopify } from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const { searchParams } = new URL(context.request.url);

	const shop = shopify(context).utils.sanitizeShop(searchParams.get("shop")!);
	if (!shop) {
		return new Response("No shop provided", { status: 400 });
	}

	return shopify(context).auth.begin({
		callbackPath: config.authCallbackPath,
		isOnline: config.isOnline,
		rawRequest: context.request,
		shop,
	});
};
