import { redirect } from "react-router";

import type { Route } from "./+types/shopify.auth";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);

	const shop = shopify.api.utils.sanitizeShop(url.searchParams.get('shop')!);
	if (!shop) return new Response('Shop param is invalid', { status: 400 });

	const host = shopify.api.utils.sanitizeHost(url.searchParams.get('host')!);

	// If we're loading from an iframe, we need to break out of it
	if (request.headers.get('Sec-Fetch-Dest') === 'iframe') {
		url.searchParams.set('shop', shop);
		let destination = `/shopify/auth?shop=${shop}`;
		if (host) {
			url.searchParams.set('host', host);
			destination = `${destination}&host=${host}`;
		}
		url.searchParams.set('exitIframe', destination);

		return redirect(`/shopify/auth/exitiframe?${url.searchParams.toString()}`);
	}

	return await shopify.api.auth.begin({
		callbackPath: '/shopify/auth/callback',
		isOnline: false,
		rawRequest: request,
		shop,
	});
}
