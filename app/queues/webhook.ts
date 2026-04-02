import { shopify, Session } from "#app/shopify.server";

export async function queue(batch: MessageBatch<QueueMessage>) {
	for (const message of batch.messages) {
		const { session, webhook } = message.body;
		console.debug("queues/webhook", webhook.webhookId);

		switch (webhook.topic) {
			case "APP_INSTALLED":
				break;

			case "APP_SCOPES_UPDATE":
				if (session) {
					await shopify.sessionStorage.storeSession(
						new Session({
							...session,
							scope: (webhook.payload as { current: string[] }).current.toString(),
						}),
					);
				}
				break;

			case "APP_UNINSTALLED":
				if (session) {
					await shopify.sessionStorage.deleteSession(session.id);
				}
				break;

			case "CUSTOMER_DATA_REQUEST":
			case "CUSTOMER_REDACT":
			case "SHOP_REDACT":
				break;
		}

		message.ack();
	}
}

export interface QueueMessage {
	session?: ConstructorParameters<typeof Session>[0];
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
