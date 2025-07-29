import {
	createTemporaryReferenceSet,
	decodeAction,
	decodeFormState,
	decodeReply,
	loadServerAction,
	renderToReadableStream,
} from '@vitejs/plugin-rsc/rsc';
import {
	unstable_matchRSCServerRequest as matchRSCServerRequest,
	unstable_RouterContextProvider as RouterContextProvider,
} from 'react-router';
import routes from 'virtual:react-router-routes';

import {type QueueHandlerMessage, queueHandler} from '#app/queues';

import * as shopify from './shopify.server';
import {appLoad} from './context';

export default {
	async fetch(request, env, ctx) {
		return matchRSCServerRequest({
			createTemporaryReferenceSet,
			decodeAction,
			decodeFormState,
			decodeReply,
			generateResponse(match, options) {
				shopify.utils.addHeaders(request, match.headers);

				return new Response(renderToReadableStream(match.payload, options), {
					status: match.statusCode,
					headers: match.headers,
				});
			},
			loadServerAction,
			onError(error: unknown) {
				if (!request.signal.aborted) {
					shopify.log.error('entry.rsc.onError', error);
				}
			},
			request,
			requestContext: new RouterContextProvider(
				new Map([[appLoad, {cloudflare: {env, ctx}}]]),
			),
			routes,
		});
	},

	async queue(batch, env, ctx): Promise<void> {
		return queueHandler(batch, {
			cloudflare: {env, ctx},
		});
	},
} satisfies ExportedHandler<Env, QueueHandlerMessage>;

export * from '#app/durable-objects';
export * from '#app/workflows';
