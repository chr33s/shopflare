import {useTranslation} from 'react-i18next';
import {Form, redirect} from 'react-router';

import {API_KEY, APP_BRIDGE_UI_URL} from '#app/const';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';

import type {Route} from './+types/index';

export async function loader({context, request}: Route.LoaderArgs) {
	log.debug('routes/index#loader');

	const url = new URL(request.url);
	if (url.searchParams.has('shop')) {
		return redirect(`/app?${url.searchParams.toString()}`);
	}

	return action({context, request} as Route.ActionArgs);
}

export default function Index({actionData, loaderData}: Route.ComponentProps) {
	const {errors} = actionData ?? loaderData;

	const {t} = useTranslation();

	return (
		<>
			<script src={APP_BRIDGE_UI_URL} />

			<s-page inlineSize="small">
				<s-section heading={t('login')}>
					<Form method="post" style={{minWidth: '250px'}}>
						<s-stack gap="base">
							<s-text-field
								error={errors?.shop}
								label={t('shopDomain')}
								name="shop"
								placeholder="example.myshopify.com"
							/>
							<s-button type="submit" variant="primary">
								{t('login')}
							</s-button>
						</s-stack>
					</Form>
				</s-section>
			</s-page>
		</>
	);
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
	const shopWithDomain = shop.includes('.')
		? shopWithoutProtocol
		: `${shopWithoutProtocol}.myshopify.com`;
	const sanitizedShop = shopify.utils.sanitizeShop(shopWithDomain);
	if (!sanitizedShop) {
		return {errors: {shop: 'INVALID_SHOP'}};
	}

	const adminPath = shopify.utils.legacyUrlToShopAdminUrl(sanitizedShop);
	const redirectUrl = `https://${adminPath}/oauth/install?client_id=${API_KEY}`;
	throw redirect(redirectUrl);
}
