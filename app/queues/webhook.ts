import * as shopify from '#app/shopify.server';

export async function queue(
	batch: MessageBatch<QueueMessage>,
	context: shopify.Context,
) {
	for (const message of batch.messages) {
		const {session, webhook} = message.body;
		shopify.log.debug('queues/webhook', webhook.webhookId);

		switch (webhook.topic) {
			case 'APP_INSTALLED':
				break;

			case 'APP_SCOPES_UPDATE':
				if (session) {
					await shopify.session(context).set(session.id, {
						...session,
						scope: (webhook.payload as {current: string[]}).current.toString(),
					});
				}
				break;

			case 'APP_UNINSTALLED':
				if (session) {
					await shopify.session(context).set(session.id, null);
				}
				break;
		}

		message.ack();
	}
}

export interface QueueMessage {
	session?: shopify.Session;
	webhook: {
		subTopic?: string;
		apiVersion: string;
		domain: string;
		hmac: string;
		topic: string;
		webhookId: string;
		payload: unknown;
	};
}
