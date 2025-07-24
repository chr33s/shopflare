import * as shopify from '#app/shopify.server';
import {log} from '#app/shopify.shared';

import type {Route} from './+types/shopify.webhooks';

export async function action({context, request}: Route.ActionArgs) {
	try {
		const {session, webhook} = await shopify.webhook(context, request);
		log.debug('routes/shopify.webhooks#action', webhook.webhookId);

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
