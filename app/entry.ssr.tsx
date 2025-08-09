import {createFromReadableStream} from '@vitejs/plugin-rsc/ssr';
import i18next from 'i18next';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server.edge';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import {
	unstable_routeRSCServerRequest as routeRSCServerRequest,
	unstable_RSCStaticRouter as RSCStaticRouter,
} from 'react-router';

import i18n, {LanguageDetector} from './i18n';
import * as shopify from './shopify.server';

export default {
	async fetch(request, env, _ctx) {
		await i18next
			.use(initReactI18next)
			.use(LanguageDetector)
			.init({
				...i18n,
				detection: {
					headers: request.headers,
					searchParams: new URL(request.url).searchParams,
				},
			});

		const bootstrapScriptContent =
			await import.meta.viteRsc.loadBootstrapScriptContent('index');

		const userAgent = request.headers.get('User-Agent');
		const response = await routeRSCServerRequest({
			createFromReadableStream,
			fetchServer: (request) => env.RSC.fetch(request),
			async renderHTML(getPayload) {
				const payload = await getPayload();
				const formState =
					payload.type === 'render' ? await payload.formState : undefined;

				const stream = await renderToReadableStream(
					<I18nextProvider defaultNS={i18n.defaultNS} i18n={i18next}>
						<RSCStaticRouter getPayload={getPayload} />
					</I18nextProvider>,
					{
						bootstrapScriptContent,
						// @ts-expect-error - no types for this yet
						formState,
						onError(error, errorInfo) {
							if (!request.signal.aborted) {
								shopify.log.error('entry.ssr.onError', error, errorInfo);
							}
						},
						signal: request.signal,
					},
				);
				if (userAgent && isbot(userAgent)) {
					await stream.allReady;
				}
				return stream;
			},
			request,
		});

		shopify.utils.addHeaders(request, response.headers);
		return response;
	},
} satisfies ExportedHandler<Env>;
