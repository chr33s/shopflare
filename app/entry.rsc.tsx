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

import * as shopify from './shopify.server';
import {routes} from './routes/config';
import {appLoad} from './context';

export default {
	async fetch(request, env, ctx) {
		const requestContext = new RouterContextProvider();
		requestContext.set(appLoad, {cloudflare: {env, ctx}});

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
			request,
			requestContext,
			routes,
		});
	},
} satisfies ExportedHandler<Env>;
