import Shop from '#app/graphql/query.shop.gql?raw';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';
import type {ShopQuery} from '#app/types/admin.generated';

import type {Route} from './+types/app.index';
import {AppIndexClient} from './app.index.client';

export async function loader({request}: Route.LoaderArgs) {
	return shopify.handler(async () => {
		const {client} = await shopify.admin(request);

		const {data, errors} = await client.request<ShopQuery>(Shop);

		log.debug('routes/app.index#loader', {data, errors});

		return {
			data,
			errors,
		};
	});
}

export default function AppIndex(props: Route.ComponentProps) {
	return <AppIndexClient {...props} />;
}

export async function action({request}: Route.ActionArgs) {
	await shopify.admin(request);

	const data = Object.fromEntries(await request.formData());
	log.debug('routes/app.index#action', {data});
	return {
		// SILENCE types through case
		data: data as unknown as ShopQuery,
		errors: null,
	};
}

export {clientAction, clientLoader} from './app.index.client';
export {headers} from './app';
