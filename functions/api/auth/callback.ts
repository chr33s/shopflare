import {
	InvalidOAuthError,
	CookieNotFound,
	BotActivityDetected,
} from "@shopify/shopify-api";
import {
	addSessionToStorage,
	createAppDataMetafield,
	config,
	shopify,
	redirectToAuth,
	registerWebhookHandlers,
} from "@/lib/shopify";
import type { Env } from "@/functions/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
	shopify(context).logger.info("Handling request to complete OAuth process");

	try {
		const response = await shopify(context).auth.callback<Headers>({
			rawRequest: context.request,
		});
		const session = response.session;

		shopify(context).logger.debug("Callback is valid, storing session", {
			shop: session.shop,
			isOnline: session.isOnline,
		});

		await addSessionToStorage(context, session);

		if (!session.isOnline) {
			context.waitUntil(registerWebhookHandlers(context, session));

			if (config.isOnline) {
				shopify(context).logger.debug(
					"Completing offline token OAuth, redirecting to online token OAuth",
					{ shop: session.shop }
				);

				return redirectToAuth(context, true);
			}
		}

		context.data = {
			...context.data,
			session,
		};

		shopify(context).logger.debug("Completed OAuth callback", {
			shop: session.shop,
			isOnline: session.isOnline,
		});

		const { searchParams } = new URL(context.request.url);
		return new Response("", {
			headers: [
				...response.headers,
				["Location", `/?${searchParams.toString()}`],
			],
			status: 302,
		});
	} catch (error: any) {
		let status = 500;
		switch (true) {
			case error instanceof InvalidOAuthError:
				status = 400;
				break;
			case error instanceof CookieNotFound:
				return redirectToAuth(context);
			case error instanceof BotActivityDetected:
				status = 410;
				break;
		}
		return new Response(error.message, { status });
	}
};
