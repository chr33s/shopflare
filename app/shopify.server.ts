import "@shopify/shopify-api/adapters/cf-worker";
import {
	LATEST_API_VERSION,
	LogSeverity,
	RequestedTokenType,
	Session,
	shopifyApi,
} from "@shopify/shopify-api";
import { type AppLoadContext, redirect } from "react-router";

export function createShopify(context: AppLoadContext) {
	const env = context.cloudflare.env;

	const api = shopifyApi({
		apiKey: env.SHOPIFY_API_KEY,
		apiSecretKey: env.SHOPIFY_API_SECRET_KEY,
		apiVersion: LATEST_API_VERSION,
		future: {
			customerAddressDefaultFix: true,
			lineItemBilling: true,
			unstable_managedPricingSupport: true,
			unstable_newEmbeddedAuthStrategy: true,
		},
		hostScheme: env.SHOPIFY_APP_URL.split("://").at(0) as "http" | "https",
		hostName: env.SHOPIFY_APP_URL.split("://").at(1)!,
		isEmbeddedApp: true,
		logger: { level: LogSeverity.Debug },
		userAgentPrefix: "ShopFlare",
	});

	async function authorize(request: Request) {
		const url = new URL(request.url);

		let encodedSessionToken = null;
		let decodedSessionToken = null;
		try {
			encodedSessionToken =
				request.headers.get("Authorization")?.replace("Bearer ", "") ||
				url.searchParams.get("id_token");
			decodedSessionToken = await api.session.decodeSessionToken(
				encodedSessionToken!,
			);
		} catch (_error) {
			const isDocumentRequest = !request.headers.has("Authorization");
			if (isDocumentRequest) {
				// Remove `id_token` from the query string to prevent an invalid session token sent to the redirect path.
				url.searchParams.delete("id_token");

				// Using shopify-reload path to redirect the bounce automatically.
				url.searchParams.append(
					"shopify-reload",
					`${url.pathname}?${url.searchParams.toString()}`,
				);
				return redirect(
					`/shopify/auth/session-token-bounce?${url.searchParams.toString()}`,
				);
			}

			throw new Response(undefined, {
				status: 401,
				statusText: "Unauthorized",
				headers: new Headers({
					"X-Shopify-Retry-Invalid-Session-Request": "1",
				}),
			});
		}

		const dest = new URL(decodedSessionToken.dest);
		const shop = dest.hostname;
		const accessToken = await api.auth.tokenExchange({
			shop,
			sessionToken: encodedSessionToken!,
			requestedTokenType: RequestedTokenType.OfflineAccessToken,
		});
		await session.set(accessToken.session);

		const client = new api.clients.Graphql({
			session: accessToken.session,
		});
		return client;
	}

	const session = new ShopifySession(env.SESSION_STORAGE);

	return {
		api,
		authorize,
		session,
	};
}

export class ShopifySession {
	#namespace: KVNamespace;

	constructor(namespace: KVNamespace) {
		this.#namespace = namespace;
	}

	async delete(id: string | undefined) {
		if (!id) return false;

		const session = await this.get(id);
		if (!session) return false;

		await this.#namespace.delete(id);
		return true;
	}

	async get(id: string | undefined) {
		if (!id) return;

		const session = await this.#namespace.get<[string, string | number][]>(
			id,
			"json",
		);
		return session ? Session.fromPropertyArray(session) : undefined;
	}

	async set(session: Session) {
		return this.#namespace.put(
			session.id,
			JSON.stringify(session.toPropertyArray()),
		);
	}
}

export {
	GraphqlQueryError,
	RequestedTokenType,
	ShopifyError,
} from "@shopify/shopify-api";
