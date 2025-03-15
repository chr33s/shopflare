import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
	type AppLoadContext,
	type EntryContext,
	ServerRouter,
} from "react-router";

import i18n, { Backend } from "./i18n";
import { getLocale } from "./i18n.server";

export default async function handleRequest(
	request: Request,
	responseStatus: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	const instance = createInstance();
	await instance
		.use(Backend)
		.use(initReactI18next)
		.init({
			...i18n,
			backend: {
				loadPath: `${loadContext.cloudflare.env.SHOPIFY_APP_URL}/i18n/{{lng}}.{{ns}}.json`,
			},
			lng: getLocale(request),
		});

	const userAgent = request.headers.get("User-Agent");
	const body = await renderToReadableStream(
		<I18nextProvider defaultNS={i18n.defaultNS} i18n={instance}>
			<ServerRouter context={routerContext} url={request.url} />
		</I18nextProvider>,
		{
			signal: request.signal,
			onError(
				// biome-ignore lint/suspicious/noExplicitAny: upstream
				error: any,
			) {
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
