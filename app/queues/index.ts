import * as webhook from "./webhook";

export function queueHandler(batch: MessageBatch<QueueHandlerMessage>) {
	console.debug("queues", batch);

	switch (batch.queue) {
		case "webhook":
			return webhook.queue(batch);
	}
}

export type QueueHandlerMessage = webhook.QueueMessage;
