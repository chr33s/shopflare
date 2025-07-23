import {appLoad} from '#app/context';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';
import {Provider} from '#app/components/proxy';
import {APP_URL} from '#app/const';

import {Component as Client} from './proxy.client';
import type {Route} from './+types/proxy';

export async function loader({context, request}: Route.LoaderArgs) {
	return shopify.handler(async () => {
		log.debug('routes/proxy.index.server#loader');

		await shopify.proxy(context.get(appLoad), request);

		const data = {};
		return {data};
	});
}

export default async function Component(props: Route.ComponentProps) {
	return (
		<Provider appUrl={APP_URL}>
			<Client {...props} />
		</Provider>
	);
}

export async function action({context, request}: Route.ActionArgs) {
	return shopify.handler(async () => {
		log.debug('routes/proxy.index.server#action');

		await shopify.proxy(context, request);

		const data = {};
		return {data};
	});
}
