import {useTranslation} from 'react-i18next';
import {Form, redirect} from 'react-router';

import {APP_BRIDGE_UI_URL} from '~/const';
import * as shopify from '~/shopify.server';

import type {Route} from './+types/index';

export async function loader({context, request}: Route.LoaderArgs) {
	const url = new URL(request.url);
	if (url.searchParams.has('shop')) {
		return redirect(`/app?${url.searchParams.toString()}`);
	}

	return action({context, request} as Route.ActionArgs);
}

export default function Index({actionData, loaderData}: Route.ComponentProps) {
	const {errors} = actionData ?? loaderData ?? {};

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

export async function action({context, request}: Route.ActionArgs) {
	const apiKey = shopify.config(context).SHOPIFY_API_KEY;

	const url = new URL(request.url);
	let shop = url.searchParams.get('shop');
	if (request.method === 'GET' && !shop) {
		return {apiKey};
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
	const redirectUrl = `https://${adminPath}/oauth/install?client_id=${apiKey}`;
	throw redirect(redirectUrl);
}
