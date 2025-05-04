import { redirect } from "react-router";

import { APP_BRIDGE_URL } from "~/const";
import { createShopify } from "~/shopify.server";
import type { Route } from "./+types/shopify.auth.session-token-bounce";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);
	shopify.utils.log.debug("shopify.auth.session-token-bounce");

	const url = new URL(request.url);
	const shop = shopify.utils.sanitizeShop(url.searchParams.get("shop")!);
	if (!shop) {
		return redirect("/shopify/auth/login");
	}

	const headers = new Headers({
		"content-type": "text/html;charset=utf-8",
	});
	shopify.utils.addHeaders(request, headers);

	return new Response(
		/* html */ `<head>
			<meta name="shopify-api-key" content="${shopify.config.apiKey}" />
			<script src="${APP_BRIDGE_URL}"></script>
		</head>`,
		{ headers },
	);
}
