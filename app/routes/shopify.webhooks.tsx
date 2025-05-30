import * as shopify from '~/shopify.server';

import type {Route} from './+types/shopify.webhooks';

export async function action({context, request}: Route.ActionArgs) {
	try {
		const {session, webhook} = await shopify.webhook(context, request);

		await context.cloudflare.env.WEBHOOK_QUEUE.send(
			{session, webhook},
			{contentType: 'json'},
		);

		return new Response(undefined, {status: 204});
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: 'Unauthorized',
		});
	}
}
