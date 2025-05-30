import {redirect} from 'react-router';

import {APP_BRIDGE_URL} from '~/const';
import * as shopify from '~/shopify.server';

import type {Route} from './+types/shopify.session-token-bounce';

export async function loader({context, request}: Route.LoaderArgs) {
	const url = new URL(request.url);
	const shop = shopify.utils.sanitizeShop(url.searchParams.get('shop')!);
	if (!shop) return redirect('/');

	const headers = new Headers({
		'Content-Type': 'text/html;charset=utf-8',
	});
	shopify.utils.addHeaders(request, headers);

	const {SHOPIFY_API_KEY} = shopify.config(context);
	return new Response(
		/* html */ `<head>
			<script data-api-key="${SHOPIFY_API_KEY}" src="${APP_BRIDGE_URL}"></script>
		</head>`,
		{headers},
	);
}
