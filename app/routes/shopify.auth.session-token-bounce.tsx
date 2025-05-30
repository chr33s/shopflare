import {redirect} from 'react-router';

import {APP_BRIDGE_URL} from '~/const';
import * as shopify from '~/shopify.server';

import type {Route} from './+types/shopify.auth.session-token-bounce';

export async function loader({context, request}: Route.LoaderArgs) {
	const url = new URL(request.url);
	const shop = shopify.utils.sanitizeShop(url.searchParams.get('shop')!);
	if (!shop) {
		return redirect('/shopify/auth/login');
	}

	const headers = new Headers({
		'Content-Type': 'text/html;charset=utf-8',
	});
	shopify.utils.addHeaders(request, headers);

	const config = shopify.config(context);
	return new Response(
		/* html */ `<head>
			<meta name="shopify-api-key" content="${config.SHOPIFY_API_KEY}" />
			<script src="${APP_BRIDGE_URL}"></script>
		</head>`,
		{headers},
	);
}
