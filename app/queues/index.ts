import type {AppLoadContext} from 'react-router';

import * as webhook from './webhook';

export function queueHandler(
	batch: MessageBatch<QueueHandlerMessage>,
	context: AppLoadContext,
) {
	console.log(`server.queue: ${JSON.stringify(batch)}`);

	switch (batch.queue) {
		case 'webhook':
			return webhook.queue(batch, context);
	}
}

export type QueueHandlerMessage = webhook.QueueMessage;
