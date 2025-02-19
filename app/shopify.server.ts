import '@shopify/shopify-api/adapters/cf-worker';
import {
	GraphqlQueryError,
	HttpResponseError,
	LATEST_API_VERSION,
	Session,
	shopifyApi,
} from '@shopify/shopify-api';
import { isbot } from "isbot";
import { type AppLoadContext, redirect } from 'react-router';

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
		hostScheme: env.SHOPIFY_APP_URL.split('://').at(0) as 'http' | 'https',
		hostName: env.SHOPIFY_APP_URL.split('://').at(1)!,
		isEmbeddedApp: true,
		userAgentPrefix: "shopflare",
	});

	async function authenticate(request: Request) {
		try {
			// respond to bots
			const userAgent = request.headers.get('User-Agent') ?? '';
			const shopifyUserAgent = /Shopify (POS|Mobile)\//;
			if (shopifyUserAgent.test(userAgent)) {
				return;
			}
			if (isbot(userAgent)) {
				return new Response(undefined, {
					status: 410,
					statusText: 'Gone'
				});
			}

			// respond to options
			if (request.method === 'OPTIONS') {
				const origin = request.headers.get('Origin');
				if (origin && origin !== env.SHOPIFY_APP_URL) {
					const response = new Response(null, {
						status: 204,
						headers: { 'Access-Control-Max-Age': '7200' },
					});
					response.headers.set('Access-Control-Allow-Origin', '*');
					response.headers.set(
						'Access-Control-Allow-Headers',
						['Authorization', 'Content-Type'].join(', '),
					);
					response.headers.set('Access-Control-Expose-Headers', 'X-Shopify-API-Request-Failure-Reauthorize-Url');
					return response;
				}
			}

			const url = new URL(request.url);
			const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
			let shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);

			// If this is a valid request, but it doesn't have a session token header, this is a document request. We need to
			// ensure we're embedded if needed and we have the information needed to load the session.
			const sessionTokenHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
			if (!sessionTokenHeader) {
				// This is a document request that doesn't contain a session token. We check if the app is installed.
				// If the app isn't installed, we initiate the OAuth auth code flow.
				// Requests with a header can only happen after the app is installed.
				if (!shop || !host) {
					if (url.pathname === "/shopify/auth/login") {
						const message = `Detected call to shopify.authenticate.admin() from configured login path ('/shopify/auth/login'), please make sure to call shopify.login() from that route instead.`;
						return new Response(message, { status: 500 });
					}

					return redirect("/shopify/auth/login");
				}

				// Ensure app is installed
				const offlineId = shop
					? api.session.getOfflineId(shop)
					: await api.session.getCurrentId({
						isOnline: false,
						rawRequest: request,
					});
				if (!(!!offlineId)) {
					return new Response(undefined, {
						status: 400,
						statusText: 'Bad Request',
					});
				}

				const offlineSession = await session.get(offlineId);
				if (!offlineSession) {
					const isEmbedded = url.searchParams.get('embedded') === '1';
					if (isEmbedded) {
						url.searchParams.set('shop', shop!);

						let destination = `/shopify/auth?shop=${shop}`;
						if (host) {
							url.searchParams.set('host', host);
							destination = `${destination}&host=${host}`;
						}
						url.searchParams.set('exitIframe', destination);

						return redirect(`/shopify/auth/exitiframe?${url.searchParams.toString()}`);
					} else {
						return await api.auth.begin({
							callbackPath: "/shopify/auth/callback",
							isOnline: false,
							rawRequest: request,
							shop: shop!,
						});
					}
				}

				shop = shop || offlineSession.shop;

				const isEmbedded = url.searchParams.get('embedded') === '1';
				if (!isEmbedded) {
					try {
						const client = new api.clients.Graphql({
							session: offlineSession,
						});
						await client.request(/* GraphQL */ `#graphql
							query ShopifyAppShopName {
								shop {
									name
								}
							}
						`);
					} catch (error) {
						if (error instanceof HttpResponseError) {
							if (error.response.code === 401) {
								return await api.auth.begin({
									callbackPath: "/shopify/auth/callback",
									isOnline: false,
									rawRequest: request,
									shop: shop!,
								});
							} else {
								return new Response(undefined, {
									status: error.response.code,
									statusText: error.response.statusText,
								});
							}
						} else if (error instanceof GraphqlQueryError) {
							const context: Record<string, string> = {shop};
							if (error.response) {
								context.response = JSON.stringify(error.body);
							}
							return new Response(undefined, {
								status: 500,
								statusText: 'Internal Server Error',
							});
						}
					}
				}
			}

			const sessionTokenSearchParam = url.searchParams.get('id_token');
			const sessionToken = (sessionTokenHeader || sessionTokenSearchParam)!;

			let payload;
			try {
				payload = await api.session.decodeSessionToken(sessionToken, {
					checkAudience: true,
				});
			} catch(error) {
				return redirect(`/shopify/auth/login?shop=${shop}`);
			}
			const dest = new URL(payload.dest);
			const sessionId = api.session.getJwtSessionId(dest.hostname, payload.sub);
			shop = dest.hostname;

			const existingSession = sessionId
				? await session.get(sessionId)
				: undefined;

			const scopes = env.SHOPIFY_API_SCOPES.split(',');
			if (!existingSession || !existingSession.isActive(scopes)) {
				const isEmbeddedRequest = url.searchParams.get('embedded') === '1';
				const isXhrRequest = request.headers.has('authorization');

				switch (true) {
					case isXhrRequest: {
						const redirectUri = new URL("/shopify/auth", env.SHOPIFY_APP_URL);
						redirectUri.searchParams.set('shop', shop!);
						return new Response(undefined, {
							headers: new Headers({
								'X-Shopify-API-Request-Failure-Reauthorize-Url': redirectUri.toString(),
							}),
							status: 401,
							statusText: 'Unauthorized',
						});
					}

					case isEmbeddedRequest: {
						let destination = `/shopify/auth?shop=${shop}`;
						url.searchParams.set('shop', shop!);

						if (host) {
							url.searchParams.set('host', host);
							destination = `${destination}&host=${host}`;
						}
						url.searchParams.set('exitIframe', destination);

						return redirect(`/shopify/auth/exitiframe?${url.searchParams.toString()}`);
					}

					default: {
						return await api.auth.begin({
							callbackPath: "/shopify/auth/callback",
							isOnline: true,
							rawRequest: request,
							shop: shop!,
						});
					}
				}
			}

			return {
				session: existingSession,
				client: new api.clients.Graphql({
					session: existingSession,
				})
			}
		} catch (error) {
			if (error instanceof Response) {
				const origin = request.headers.get('Origin');
				if (origin && origin !== env.SHOPIFY_APP_URL) {
					const response = new Response(null, {
						status: 204,
						headers: { 'Access-Control-Max-Age': '7200' },
					});
					response.headers.set('Access-Control-Allow-Origin', '*');
					response.headers.set(
						'Access-Control-Allow-Headers',
						['Authorization', 'Content-Type'].join(', '),
					);
					response.headers.set('Access-Control-Expose-Headers', 'X-Shopify-API-Request-Failure-Reauthorize-Url');
					return response;
				}
			}

			throw error;
		}
	}

	const hooks = {
		afterAuth: async function afterAuthHook(session: Session) {
			// ... implement
		}
	}

	const session = new ShopifySession(env.SESSION_STORAGE);

	return {
		api,
		authenticate,
		hooks,
		session,
	}
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

		const session = await this.#namespace.get<[string, string | number][]>(id, 'json');
		return session ? Session.fromPropertyArray(session) : undefined
	}

	async set(session: Session) {
		return this.#namespace.put(session.id, JSON.stringify(session.toPropertyArray()));
	}
}

export { RequestedTokenType, ShopifyError } from "@shopify/shopify-api";