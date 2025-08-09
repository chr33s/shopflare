import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';

import type {Route} from './+types/proxy.index';
import {ProxyIndexClient} from './proxy.index.client';

export async function loader({request}: Route.LoaderArgs) {
	return shopify.handler(async () => {
		log.debug('routes/proxy.index#loader');

		await shopify.proxy(request);

		const data = {};
		return {data};
	});
}

export default function ProxyIndex(props: Route.ComponentProps) {
	return <ProxyIndexClient {...props} />;
}

export async function action({request}: Route.ActionArgs) {
	return shopify.handler(async () => {
		log.debug('routes/proxy.index#action');

		await shopify.proxy(request);

		const data = {};
		return {data};
	});
}
