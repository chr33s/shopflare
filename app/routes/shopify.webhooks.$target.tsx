import * as shopify from '~/shopify.server';

import type {Route} from './+types/shopify.webhooks.$target';

export async function action({context, params, request}: Route.ActionArgs) {
	try {
		const {session, webhook} = await shopify.webhook(context, request);
		shopify.log.debug('routes/shopify.webhooks#action', webhook.webhookId);

		switch (params.target) {
			default:
			case 'queue': {
				await context.cloudflare.env.WEBHOOK_QUEUE.send(
					{session, webhook},
					{contentType: 'json'},
				);
				break;
			}

			case 'workflow': {
				await context.cloudflare.env.WEBHOOK_WORKFLOW.create({
					id: webhook.webhookId,
					params: {session, webhook},
				});
				break;
			}
		}

		return new Response(undefined, {status: 204});
	} catch (error: any) {
		return new Response(error.message, {
			status: error.status,
			statusText: 'Unauthorized',
		});
	}
}
