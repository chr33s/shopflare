import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
	type AppLoadContext,
	type EntryContext,
	ServerRouter,
} from "react-router";

import i18n, { LanguageDetector } from "./i18n";
import { createShopify } from "./shopify.server";

export default async function handleRequest(
	request: Request,
	responseStatus: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	createShopify(loadContext).utils.addHeaders(request, responseHeaders);

	const instance = createInstance();
	await instance
		.use(initReactI18next)
		.use(LanguageDetector)
		.init({
			...i18n,
			detection: {
				headers: request.headers,
				searchParams: new URL(request.url).searchParams,
			},
		});

	const userAgent = request.headers.get("User-Agent");
	const body = await renderToReadableStream(
		<I18nextProvider defaultNS={i18n.defaultNS} i18n={instance}>
			<ServerRouter context={routerContext} url={request.url} />
		</I18nextProvider>,
		{
			signal: request.signal,
			onError(error: unknown) {
				responseStatus = 500;
				if (!request.signal.aborted) {
					// Log streaming rendering errors from inside the shell
					console.error("entry.server.onError", error);
				}
			},
		},
	);

	// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
	// https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
	if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
		await body.allReady;
	} else {
		responseHeaders.set("Transfer-Encoding", "chunked");
	}

	responseHeaders.set("Content-Type", "text/html");
	return new Response(body, {
		headers: responseHeaders,
		status: responseStatus,
	});
}
