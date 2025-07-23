import {redirect} from 'react-router';

import {API_KEY} from '#app/const';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';

import {Component as Client} from './index.client';
import type {Route} from './+types/index';

export async function loader({context, request}: Route.LoaderArgs) {
	log.debug('routes/index#loader');

	const url = new URL(request.url);
	if (url.searchParams.has('shop')) {
		return redirect(`/app?${url.searchParams.toString()}`);
	}

	return action({context, request} as Route.ActionArgs);
}

export default async function Component(props: Route.ComponentProps) {
	log.debug('routes/index#Component');
	return <Client {...props} />;
}

export async function action({request}: Route.ActionArgs) {
	log.debug('routes/app.proxy.index#action');

	const url = new URL(request.url);
	let shop = url.searchParams.get('shop');
	if (request.method === 'GET' && !shop) {
		return {};
	}

	if (!shop) {
		shop = (await request.formData()).get('shop') as string;
	}
	if (!shop) {
		return {errors: {shop: 'MISSING_SHOP'}};
	}

	const shopWithoutProtocol = shop
		.replace(/^https?:\/\//, '')
		.replace(/\/$/, '');
	const shopWithDomain =
		shop?.indexOf('.') === -1
			? `${shopWithoutProtocol}.myshopify.com`
			: shopWithoutProtocol;
	const sanitizedShop = shopify.utils.sanitizeShop(shopWithDomain);
	if (!sanitizedShop) {
		return {errors: {shop: 'INVALID_SHOP'}};
	}

	const adminPath = shopify.utils.legacyUrlToShopAdminUrl(sanitizedShop);
	const redirectUrl = `https://${adminPath}/oauth/install?client_id=${API_KEY}`;
	throw redirect(redirectUrl);
}
