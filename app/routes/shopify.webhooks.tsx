import * as shopify from '~/shopify.server';

import type {Route} from './+types/shopify.webhooks';

export async function action({context, request}: Route.ActionArgs) {
	try {
		const {session, webhook} = await shopify.webhook(context, request);
		console.log('routes/shopify.webhooks#action:', webhook.webhookId);

		if (context.cloudflare.env.WEBHOOK_QUEUE) {
			await context.cloudflare.env.WEBHOOK_QUEUE.send(
				{session, webhook},
				{contentType: 'json'},
			);
		}
		if (context.cloudflare.env.WEBHOOK_WORKFLOW) {
			await context.cloudflare.env.WEBHOOK_WORKFLOW.create({
				id: webhook.webhookId,
				params: {session, webhook},
			});
		}

		return new Response(undefined, {status: 204});
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: 'Unauthorized',
		});
	}
}
