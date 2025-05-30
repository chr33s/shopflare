import {Outlet} from 'react-router';

import {Provider} from '~/components/proxy';
import * as shopify from '~/shopify.server';

import type {Route} from './+types/proxy';

export async function loader({context, request}: Route.LoaderArgs) {
	try {
		await shopify.proxy(context, request);

		const config = shopify.config(context);
		return {appUrl: config.SHOPIFY_APP_URL};
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: 'Unauthorized',
		});
	}
}

export default function ProxyRoute({loaderData}: Route.ComponentProps) {
	const {appUrl} = loaderData ?? {};

	return (
		<Provider appUrl={appUrl}>
			<Outlet />
		</Provider>
	);
}
