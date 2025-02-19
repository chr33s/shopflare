import type { Route } from "./+types/shopify.auth";
import { APP_BRIDGE_URL } from '~/const';
import { createShopify } from "~/shopify.server";

export async function loader({ context, request }: Route.LoaderArgs) {
	const shopify = createShopify(context);

	const url = new URL(request.url);

	const headers = new Headers({
		'content-type': 'text/html;charset=utf-8',
	});

	const shop = shopify.api.utils.sanitizeShop(url.searchParams.get('shop')!);
	if (shop) {
		headers.set(
			'Link',
			`<${APP_BRIDGE_URL}>; rel="preload"; as="script";`,
		);
		headers.set(
			'Content-Security-Policy',
			`frame-ancestors https://${shop} https://admin.shopify.com;`,
		);
	}

	const exitIframe = JSON.stringify(url.searchParams.get('exitIframe')!.toString());

	return new Response(/* html */ `
		<head>
			<meta name="shopify-api-key" content="${context.cloudflare.env.SHOPIFY_API_KEY}" />
			<script src="${APP_BRIDGE_URL}"></script>
			<script>window.open(${exitIframe}, "_top")</script>
		</head>
		`,
		{ headers },
	);
}
