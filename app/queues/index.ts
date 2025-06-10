import type {AppLoadContext} from 'react-router';

import * as shopify from '~/shopify.server';

import * as webhook from './webhook';

export function queueHandler(
	batch: MessageBatch<QueueHandlerMessage>,
	context: AppLoadContext,
) {
	shopify.log.debug('queues', batch);

	switch (batch.queue) {
		case 'webhook':
			return webhook.queue(batch, context);
	}
}

export type QueueHandlerMessage = webhook.QueueMessage;
