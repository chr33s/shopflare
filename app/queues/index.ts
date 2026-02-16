import * as shopify from "#app/shopify.server";
import * as webhook from "./webhook";

export function queueHandler(batch: MessageBatch<QueueHandlerMessage>) {
	shopify.log.debug("queues", batch);

	switch (batch.queue) {
		case "webhook":
			return webhook.queue(batch);
	}
}

export type QueueHandlerMessage = webhook.QueueMessage;
