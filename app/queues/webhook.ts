import * as shopify from "#app/shopify.server";

export async function queue(batch: MessageBatch<QueueMessage>) {
	for (const message of batch.messages) {
		const { session, webhook } = message.body;
		shopify.log.debug("queues/webhook", webhook.webhookId);

		switch (webhook.topic) {
			case "app/installed":
				break;

			case "app/scopes_update":
				if (session) {
					await shopify.session().set(session.id, {
						...session,
						scope: (webhook.payload as { current: string[] }).current.toString(),
					});
				}
				break;

			case "app/uninstalled":
				if (session) {
					await shopify.session().set(session.id, null);
				}
				break;

			case "customer/data_request":
			case "customer/redact":
			case "shop/redact":
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
