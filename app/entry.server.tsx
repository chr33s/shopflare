import { createInstance } from "i18next";
import Backend from "i18next-fetch-backend";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
	type AppLoadContext,
	type EntryContext,
	ServerRouter,
} from "react-router";

import i18nConfig from "./i18n";
import i18n from "./i18n.server";

export default async function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	const instance = createInstance();
	await instance
		.use(initReactI18next)
		.use(Backend)
		.init({
			...i18nConfig,
			backend: {
				...i18nConfig.backend,
				loadPath: `${loadContext.cloudflare.env.SHOPIFY_APP_URL}/i18n/{{lng}}.{{ns}}.json`,
			},
			lng: await i18n.getLocale(request),
			ns: i18n.getRouteNamespaces(routerContext),
		});

	const userAgent = request.headers.get("User-Agent");
	const stream = await renderToReadableStream(
		<I18nextProvider defaultNS={["app", "polaris"]} i18n={instance}>
			<ServerRouter context={routerContext} url={request.url} />
		</I18nextProvider>,
		{
			signal: request.signal,
			onError(
				// biome-ignore lint/suspicious/noExplicitAny: upstream
				error: any,
			) {
				if (!request.signal.aborted) {
					// Log streaming rendering errors from inside the shell
					console.error("entry.server.onError", error);
				}
				status = Number.isNaN(error?.error?.status) ? 500 : error.error.status;
			},
		},
	);

	if (isbot(userAgent)) await stream.allReady;

	headers.set("Content-Type", "text/html; charset=utf-8");
	headers.set("Transfer-Encoding", "chunked");

	return new Response(stream, { status, headers });
}
