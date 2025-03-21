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
import i18n, { Backend } from "./i18n";
import { getLocale } from "./i18n.server";
import { createShopify } from "./shopify.server";

export default async function handleRequest(
	request: Request,
	responseStatus: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
	loadContext: AppLoadContext,
) {
	responseHeaders.set("Content-Type", "text/html");
	responseHeaders.set("X-Content-Type-Options", "nosniff");
	responseHeaders.set("X-Download-Options", "noopen");
	responseHeaders.set("X-Permitted-Cross-Domain-Policies", "none");
	responseHeaders.set("Referrer-Policy", "origin-when-cross-origin");
	responseHeaders.set(
		"Content-Security-Policy",
		"default-src 'self'; \
		script-src 'self' 'unsafe-inline' https://cdn.shopify.com; \
		style-src 'self' 'unsafe-inline' https://cdn.shopify.com https://unpkg.com; \
		font-src 'self' https://cdn.shopify.com; \
		img-src 'self' data: https://cdn.shopify.com; \
		connect-src 'self' https://atlas.shopifysvc.com https://extensions.shopifycdn.com; \
		upgrade-insecure-requests",
	);
	responseHeaders.set(
		"Strict-Transport-Security",
		"max-age=631138519; includeSubDomains",
	);
	responseHeaders.set(
		"Link",
		`<${APP_BRIDGE_URL}>; rel="preload"; as="script";`,
	);
	const shop = createShopify(loadContext).utils.sanitizeShop(
		new URL(request.url).searchParams.get("shop")!,
	);
	if (shop) {
		responseHeaders.set(
			"Content-Security-Policy",
			`frame-ancestors https://${shop} https://admin.shopify.com;`,
		);
	}

	const instance = createInstance();
	await instance
		.use(Backend)
		.use(initReactI18next)
		.init({
			...i18n,
			lng: getLocale(request),
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
