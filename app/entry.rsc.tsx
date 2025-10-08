import {
	createTemporaryReferenceSet,
	decodeAction,
	decodeFormState,
	decodeReply,
	loadServerAction,
	renderToReadableStream,
} from '@vitejs/plugin-rsc/rsc';
import {
	RouterContextProvider,
	unstable_matchRSCServerRequest as matchRSCServerRequest,
} from 'react-router';
import routes from 'virtual:react-router-routes';

import {queueHandler, type QueueHandlerMessage} from '#app/queues';

import * as shopify from './shopify.server';

export default {
	async fetch(request) {
		return matchRSCServerRequest({
			createTemporaryReferenceSet,
			decodeAction,
			decodeFormState,
			decodeReply,
			generateResponse(match, options) {
				shopify.utils.addHeaders(request, match.headers);

				return new Response(renderToReadableStream(match.payload, options), {
					headers: match.headers,
					status: match.statusCode,
				});
			},
			loadServerAction,
			onError(error: unknown) {
				if (!request.signal.aborted) {
					shopify.log.error('entry.rsc.onError', error);
				}
			},
			request,
			requestContext: new RouterContextProvider(),
			routes,
		});
	},

	async queue(batch): Promise<void> {
		return queueHandler(batch);
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from '#app/durable-objects';
