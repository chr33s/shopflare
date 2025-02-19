import {
	CookieNotFound,
	InvalidHmacError,
	InvalidOAuthError,
} from '@shopify/shopify-api';
import { redirect } from "react-router";

import type { Route } from "./+types/shopify.auth";
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);

	const shop = shopify.api.utils.sanitizeShop(url.searchParams.get('shop')!);
	if (!shop) return new Response('Shop param is invalid', { status: 400 })

	const host = shopify.api.utils.sanitizeHost(url.searchParams.get('host')!);

	try {
		const callback = await shopify.api.auth.callback({
			rawRequest: request,
		});
		await shopify.session.set(callback.session);

		if (!callback.session.isOnline) {
			return await shopify.api.auth.begin({
				shop,
				callbackPath: "/shopify/auth/callback",
				isOnline: true,
				rawRequest: request,
			});
		}

		context.cloudflare.ctx.waitUntil(shopify.hooks.afterAuth(callback.session));

		const redirectUrl = await shopify.api.auth.getEmbeddedAppUrl({ rawRequest: request });
		return redirect(redirectUrl, { headers: callback.headers });
	} catch (error) {
		console.error(error);

		switch (true) {
			case error instanceof Response: throw error;

			case error instanceof CookieNotFound: {
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
					shop,
					callbackPath: "/shopify/auth/callback",
					isOnline: false,
					rawRequest: request,
				});
			}

			case error instanceof InvalidHmacError:
			case error instanceof InvalidOAuthError: {
				return new Response(undefined, {
					status: 400,
					statusText: 'Invalid OAuth Request',
				});
			}

			default: {
				return new Response(undefined, {
					status: 500,
					statusText: 'Internal Server Error',
				});
			}
		}
	}
}
