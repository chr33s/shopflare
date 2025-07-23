import {appLoad} from '#app/context';
import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';
import type {ShopQuery} from '#app/types/admin.generated';

import {Component as Client} from './app.client';
import type {Route} from './+types/app';

export async function loader({context, request}: Route.LoaderArgs) {
	return shopify.handler(async () => {
		const {client} = await shopify.admin(context.get(appLoad), request);

		const {data, errors} = await client.request<ShopQuery>(/* GraphQL */ `
			#graphql
			query Shop {
				shop {
					name
				}
			}
		`);

		log.debug('routes/app.index#loader', {data, errors});

		return {
			data,
			errors,
		};
	});
}

export default async function Component(props: Route.ComponentProps) {
	return <Client {...props} />;
}

export async function action({context, request}: Route.ActionArgs) {
	await shopify.admin(context, request);

	const data = Object.fromEntries(await request.formData());
	log.debug('routes/app.index#action', {data});
	return {data};
}

export {clientAction, clientLoader} from './app.client';
