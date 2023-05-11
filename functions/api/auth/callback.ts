import {
	addSessionToStorage,
	config,
	shopify,
	redirectToAuth,
	registerWebhookHandlers,
} from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
	await shopify(context).logger.info(
		"Handling request to complete OAuth process"
	);

	const response = await shopify(context).auth.callback<Headers>({
		rawRequest: context.request,
	});
	await shopify(context).logger.debug("Callback is valid, storing session", {
		shop: response.session.shop,
		isOnline: response.session.isOnline,
	});

	const session = response.session;
	await addSessionToStorage(context, session.toObject());

	// If this is an offline OAuth process, register webhooks
	if (!response.session.isOnline) {
		context.waitUntil(registerWebhookHandlers(context, response.session));
	}

	// If we're completing an offline OAuth process, immediately kick off the online one
	if (config.isOnline && !response.session.isOnline) {
		await shopify(context).logger.debug(
			"Completing offline token OAuth, redirecting to online token OAuth",
			{ shop: response.session.shop }
		);

		return await redirectToAuth(context, true);
	}

	context.data = {
		...context.data,
		session: response.session,
	};

	await shopify(context).logger.debug("Completed OAuth callback", {
		shop: response.session.shop,
		isOnline: response.session.isOnline,
	});

	const { searchParams } = new URL(context.request.url);
	return new Response("", {
		headers: [
			...response.headers,
			["Location", `/?${searchParams.toString()}`],
		],
		status: 302,
	});
};
