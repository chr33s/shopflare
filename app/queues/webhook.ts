import type { AppLoadContext } from "react-router";

import * as shopify from "~/shopify.server";

export async function queue(
	batch: MessageBatch<QueueMessage>,
	context: AppLoadContext,
) {
	for (const message of batch.messages) {
		const { session, webhook } = message.body;

		switch (webhook.topic) {
			case "APP_UNINSTALLED":
				if (session) {
					await shopify.session(context).set(session.id, null);
				}
				break;

			case "APP_SCOPES_UPDATE":
				if (session) {
					await shopify.session(context).set(session.id, {
						...session,
						scope: (
							webhook.payload as { current: string[] }
						).current.toString(),
					});
				}
				break;
		}

		message.ack();
	}
}

export interface QueueMessage {
	session: shopify.Session;
	webhook: {
		subTopic: string;
		apiVersion: string;
		domain: string;
		hmac: string;
		topic: string;
		webhookId: string;
		payload: unknown;
	};
}
