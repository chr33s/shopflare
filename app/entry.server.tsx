import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import {
	type AppLoadContext,
	type EntryContext,
	ServerRouter,
} from "react-router";

import { APP_BRIDGE_URL } from "~/const";
import i18n, { LanguageDetector } from "./i18n";
import { createShopify } from "./shopify.server";

export default async function handleRequest(
	request: Request,
	responseStatus: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	responseHeaders.set("X-Content-Type-Options", "nosniff");
	responseHeaders.set("X-Download-Options", "noopen");
	responseHeaders.set("X-Permitted-Cross-Domain-Policies", "none");
	responseHeaders.set("Referrer-Policy", "origin-when-cross-origin");
	const url = new URL(request.url);
	const shop = createShopify(loadContext).utils.sanitizeShop(
		url.searchParams.get("shop")!,
	);
	responseHeaders.set(
		"Content-Security-Policy",
		[
			"default-src 'self';",
			"script-src 'self' 'unsafe-inline' https://cdn.shopify.com;",
			"style-src 'self' 'unsafe-inline' https://cdn.shopify.com;",
			"font-src 'self' https://cdn.shopify.com;",
			"img-src 'self' data: https://cdn.shopify.com;",
			"connect-src 'self' https://atlas.shopifysvc.com https://extensions.shopifycdn.com;",
			`frame-ancestors ${shop ? `https://${shop}` : ""} https://admin.shopify.com;`,
			url.hostname !== "localhost" ? "upgrade-insecure-requests" : "",
		].join(" "),
	);
	responseHeaders.set(
		"Strict-Transport-Security",
		"max-age=631138519; includeSubDomains",
	);
	responseHeaders.set(
		"Link",
		`<${APP_BRIDGE_URL}>; rel="preload"; as="script";`,
	);

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
				// biome-ignore lint/style/noParameterAssign: upstream
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
