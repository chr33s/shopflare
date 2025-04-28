import { createGraphQLClient } from "@shopify/graphql-client";
import { type JWTPayload, jwtVerify } from "jose";
import { type AppLoadContext, redirect as routerRedirect } from "react-router";
import * as v from "valibot";

import { API_VERSION, APP_BRIDGE_URL } from "./const";

export function createShopify(context: AppLoadContext) {
	const env = v.parse(schema, context.cloudflare.env);
	const config = {
		apiKey: env.SHOPIFY_API_KEY,
		apiSecretKey: env.SHOPIFY_API_SECRET_KEY,
		apiVersion: API_VERSION,
		appHandle: env.SHOPIFY_APP_HANDLE,
		appUrl: env.SHOPIFY_APP_URL,
		appLogLevel: env.SHOPIFY_APP_LOG_LEVEL,
		appTest: env.SHOPIFY_APP_TEST === "1",
	};

	async function admin(request: Request) {
		const url = new URL(request.url);

		let encodedSessionToken = null;
		let decodedSessionToken = null;
		try {
			encodedSessionToken =
				request.headers.get("Authorization")?.replace("Bearer ", "") ||
				url.searchParams.get("id_token") ||
				"";

			const key = config.apiSecretKey;
			const hmacKey = new Uint8Array(key.length);
			for (let i = 0, keyLen = key.length; i < keyLen; i++) {
				hmacKey[i] = key.charCodeAt(i);
			}

			const { payload } = await jwtVerify(encodedSessionToken, hmacKey, {
				algorithms: ["HS256"],
				clockTolerance: 10,
			});

			// The exp and nbf fields are validated by the JWT library
			if (payload.aud !== config.apiKey) {
				throw new ShopifyException("Session token had invalid API key", {
					status: 401,
					type: "JWT",
				});
			}
			decodedSessionToken = payload as ShopifyJWTPayload;
		} catch (_error) {
			const isDocumentRequest = !request.headers.has("Authorization");
			if (isDocumentRequest) {
				// Remove `id_token` from the query string to prevent an invalid session token sent to the redirect path.
				url.searchParams.delete("id_token");

				// Using shopify-reload path to redirect the bounce automatically.
				url.searchParams.append(
					"shopify-reload",
					`${config.appUrl}${url.pathname}?${url.searchParams.toString()}`,
				);
				throw routerRedirect(
					`/shopify/auth/session-token-bounce?${url.searchParams.toString()}`,
				);
			}

			throw new Response(undefined, {
				headers: new Headers({
					"X-Shopify-Retry-Invalid-Session-Request": "1",
				}),
				status: 401,
				statusText: "Unauthorized",
			});
		}

		const shop = utils.sanitizeShop(new URL(decodedSessionToken.dest).hostname);
		if (!shop) {
			throw new ShopifyException("Received invalid shop argument", {
				status: 400,
				type: "SHOP",
			});
		}

		const body = {
			client_id: config.apiKey,
			client_secret: config.apiSecretKey,
			grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
			subject_token: encodedSessionToken,
			subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
			requested_token_type:
				"urn:shopify:params:oauth:token-type:offline-access-token",
		};

		const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			signal: AbortSignal.timeout(1_000),
		});
		if (!response.ok) {
			// biome-ignore lint/suspicious/noExplicitAny: upstream
			const body: any = await response.json();
			if (typeof response === "undefined") {
				const message = body?.errors?.message ?? "";
				throw new ShopifyException(
					`Http request error, no response available: ${message}`,
					{
						status: 400,
						type: "REQUEST",
					},
				);
			}

			if (response.status === 200 && body.errors.graphQLErrors) {
				throw new ShopifyException(
					body.errors.graphQLErrors?.[0].message ?? "GraphQL operation failed",
					{
						status: 400,
						type: "GRAPHQL",
					},
				);
			}

			const errorMessages: string[] = [];
			if (body.errors) {
				errorMessages.push(JSON.stringify(body.errors, null, 2));
			}
			const xRequestId = response.headers.get("x-request-id");
			if (xRequestId) {
				errorMessages.push(
					`If you report this error, please include this id: ${xRequestId}`,
				);
			}

			const errorMessage = errorMessages.length
				? `:\n${errorMessages.join("\n")}`
				: "";

			switch (true) {
				case response.status === 429: {
					throw new ShopifyException(
						`Shopify is throttling requests ${errorMessage}`,
						{
							status: response.status,
							type: "THROTTLING",
							// retryAfter: response.headers.has("Retry-After") ? parseFloat(response.headers.get("Retry-After")) : undefined,
						},
					);
				}
				case response.status >= 500:
					throw new ShopifyException(`Shopify internal error${errorMessage}`, {
						status: response.status,
						type: "SERVER",
					});
				default:
					throw new ShopifyException(
						`Received an error response (${response.status} ${response.statusText}) from Shopify${errorMessage}`,
						{
							status: response.status,
							type: "RESPONSE",
						},
					);
			}
		}

		const accessTokenResponse = await response.json<{
			access_token: string;
			expires_in?: number;
			scope: string;
		}>();
		await session.set({
			id: shop,
			shop,
			scope: accessTokenResponse.scope,
			expires: accessTokenResponse.expires_in
				? new Date(Date.now() + accessTokenResponse.expires_in * 1000)
				: undefined,
			accessToken: accessTokenResponse.access_token,
		});

		const client = createClient({
			headers: { "X-Shopify-Access-Token": accessTokenResponse.access_token },
			shop,
		});
		return client;
	}

	function createClient({
		apiVersion = config.apiVersion,
		headers,
		shop,
	}: {
		apiVersion?: string;
		shop: string;
		headers: Record<string, string | string[]>;
	}) {
		const client = createGraphQLClient({
			customFetchApi: fetch,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			url: `https://${shop}/admin/api/${apiVersion}/graphql.json`,
		});
		return client;
	}

	function createLogger() {
		const levels = ["error", "info", "debug"];
		const level = levels.findIndex((level) => level === config.appLogLevel);

		function noop() {}

		return {
			debug(...args: unknown[]) {
				if (level >= 2) {
					return console.debug("logger.debug", ...args);
				}
				return noop;
			},

			info(...args: unknown[]) {
				if (level >= 1) {
					return console.info("logger.info", ...args);
				}
				return noop;
			},

			error(...args: unknown[]) {
				if (level >= 0) {
					return console.error("logger.error", ...args);
				}
				return noop;
			},
		};
	}

	async function proxy(request: Request) {
		const url = new URL(request.url);

		const param = url.searchParams.get("signature");
		if (param === null) {
			throw new ShopifyException("Proxy param is missing", {
				status: 400,
				type: "REQUEST",
			});
		}

		const timestamp = Number(url.searchParams.get("timestamp"));
		if (
			Math.abs(Math.trunc(Date.now() / 1000) - timestamp) > 90 // HMAC_TIMESTAMP_PERMITTED_CLOCK_TOLERANCE_SEC
		) {
			throw new ShopifyException("Proxy timestamp is expired", {
				status: 400,
				type: "REQUEST",
			});
		}

		// NOTE: https://shopify.dev/docs/apps/build/online-store/display-dynamic-data#calculate-a-digital-signature
		const params = Object.entries(Object.fromEntries(url.searchParams))
			.filter(([key]) => key !== "signature")
			.map(
				([key, value]) =>
					`${key}=${Array.isArray(value) ? value.join(",") : value}`,
			)
			.sort((a, b) => a.localeCompare(b))
			.join("");

		await validateHmac(params, param, "hex");

		const shop = utils.sanitizeShop(url.searchParams.get("shop")!)!; // shop is value due to hmac validation
		const shopify = await session.get(shop);
		if (!shopify?.accessToken) {
			throw new ShopifyException("No session access token", {
				status: 401,
				type: "SESSION",
			});
		}

		const client = createClient({
			headers: { "X-Shopify-Access-Token": shopify.accessToken },
			shop,
		});

		return client;
	}

	function redirect(
		request: Request,
		url: string,
		{
			shop,
			target,
			...init
		}: ResponseInit & {
			shop: string;
			target?: "_self" | "_parent" | "_top" | "_blank";
		},
	) {
		const headers = new Headers({
			"content-type": "text/html;charset=utf-8",
			...init.headers,
		});

		let windowTarget = target ?? "_self";
		let windowUrl = new URL(url, config.appUrl);

		const isSameOrigin = config.appUrl === windowUrl.origin;
		const isRelativePath = url.startsWith("/");
		if (isSameOrigin || isRelativePath) {
			for (const [key, value] of new URL(request.url).searchParams.entries()) {
				if (!windowUrl.searchParams.has(key)) {
					windowUrl.searchParams.set(key, value);
				}
			}
		}

		const adminLinkRegExp = /^shopify:\/*admin\//i;
		const isAdminLink = adminLinkRegExp.test(url);
		if (isAdminLink) {
			const shopHandle = shop.replace(".myshopify.com", "");
			const adminUri = url.replace(adminLinkRegExp, "/");
			windowUrl = new URL(
				`https://admin.shopify.com/store/${shopHandle}${adminUri}`,
			);

			const remove = [
				"appLoadId", // sent when clicking rel="home" nav item
				"hmac",
				"host",
				"embedded",
				"id_token",
				"locale",
				"protocol",
				"session",
				"shop",
				"timestamp",
			];
			for (const param of remove) {
				if (windowUrl.searchParams.has(param)) {
					windowUrl.searchParams.delete(param);
				}
			}

			if (!target) {
				windowTarget = "_parent";
			}
		}

		switch (true) {
			case target === "_self" && isBounce(request):
			case target !== "_self" && isEmbedded(request): {
				throw new Response(
					/* html */ `<head>
						<meta name="shopify-api-key" content="${config.apiKey}" />
						<script src="${APP_BRIDGE_URL}"></script>
						<script>
							window.open(
								${JSON.stringify(windowUrl.toString())},
								${JSON.stringify(windowTarget)},
							)
						</script>
					</head>`,
					{
						...init,
						headers,
					},
				);
			}

			case isData(request): {
				throw new Response(undefined, {
					headers: new Headers({
						"X-Shopify-API-Request-Failure-Reauthorize-Url":
							windowUrl.toString(),
					}),
					status: 401,
					statusText: "Unauthorized",
				});
			}

			default: {
				throw routerRedirect(url, init);
			}
		}

		function authorizationHeader(request: Request) {
			return request.headers.get("authorization")?.replace(/Bearer\s?/, "");
		}

		function isBounce(request: Request) {
			return (
				!!authorizationHeader(request) &&
				request.headers.has("X-Shopify-Bounce")
			);
		}

		function isData(request: Request) {
			return (
				!!authorizationHeader(request) &&
				!isBounce(request) &&
				(!isEmbedded(request) || request.method !== "GET")
			);
		}

		function isEmbedded(request: Request) {
			return new URL(request.url).searchParams.get("embedded") === "1";
		}
	}

	const session = new ShopifySession(context.cloudflare.env.SESSION_STORAGE);

	const utils = {
		allowedDomains: ["myshopify.com", "shopify.com", "myshopify.io"]
			.map((v) => v.replace(/\./g, "\\.")) // escape
			.join("|"),

		legacyUrlToShopAdminUrl(shop: string) {
			const shopUrl = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
			const regex = /(.+)\\.myshopify\\.com$/;

			const matches = shopUrl.match(regex);
			if (matches && matches.length === 2) {
				const shopName = matches[1];
				return `admin.shopify.com/store/${shopName}`;
			}
			return null;
		},

		log: createLogger(),

		sanitizeHost(host: string) {
			const base64regex = /^[0-9a-z+/]+={0,2}$/i;
			let sanitizedHost = base64regex.test(host) ? host : null;
			if (sanitizedHost) {
				const { hostname } = new URL(`https://${atob(sanitizedHost)}`);

				const hostRegex = new RegExp(`\\.(${utils.allowedDomains})$`);
				if (!hostRegex.test(hostname)) {
					sanitizedHost = null;
				}
			}
			return sanitizedHost;
		},

		sanitizeShop(shop: string) {
			let shopUrl: string = shop;

			const shopAdminRegex = new RegExp(
				`^admin\\.(?:${utils.allowedDomains})/store/(?:[a-zA-Z0-9]\\w*)$`,
			);
			if (shopAdminRegex.test(shopUrl)) {
				shopUrl = shopUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
				if (shopUrl.split(".")[0] !== "admin") {
					return null;
				}

				const regex = /admin\..+\/store\/[^/]+/;
				const matches = shopUrl.match(regex);
				if (matches && matches.length === 2) {
					const shopName = matches[1];
					shopUrl = `${shopName}.myshopify.com`;
				} else {
					return null;
				}
			}

			const shopUrlRegex = new RegExp(
				`^[a-zA-Z0-9][\\w-]*\\.(?:${utils.allowedDomains})$`,
			);
			const sanitizedShop = shopUrlRegex.test(shopUrl) ? shopUrl : null;
			return sanitizedShop;
		},
	};

	async function validateHmac(
		data: string,
		hmac: string,
		encoding: "hex" | "base64",
	) {
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			"raw",
			encoder.encode(config.apiSecretKey),
			{
				name: "HMAC",
				hash: "SHA-256",
			},
			false,
			["sign"],
		);
		const signature = await crypto.subtle.sign(
			"HMAC",
			key,
			encoder.encode(data),
		);
		let computed: string;
		switch (encoding) {
			case "base64":
				computed = btoa(String.fromCharCode(...new Uint8Array(signature)));
				break;

			case "hex":
				computed = [...new Uint8Array(signature)].reduce(
					(a, b) => a + b.toString(16).padStart(2, "0"),
					"",
				);
				break;
		}

		const bufA = encoder.encode(computed);
		const bufB = encoder.encode(hmac);
		if (bufA.byteLength !== bufB.byteLength) {
			throw new ShopifyException("Encoded byte length mismatch", {
				status: 401,
				type: "HMAC",
			});
		}

		// biome-ignore lint/suspicious/noExplicitAny: lib: [DOM] overrides worker-configuration.d.ts
		const valid = (crypto.subtle as any).timingSafeEqual(bufA, bufB);
		utils.log.debug("validateHmac", {
			hmac,
			computed,
			valid,
		});
		if (!valid) {
			throw new ShopifyException("Invalid hmac", {
				status: 401,
				type: "HMAC",
			});
		}
	}

	async function webhook(request: Request) {
		// validate.body
		const body = await request.clone().text();
		if (body.length === 0) {
			throw new ShopifyException("Webhook body is missing", {
				status: 400,
				type: "REQUEST",
			});
		}

		// validate.hmac
		const header = request.headers.get("X-Shopify-Hmac-Sha256");
		if (header === null) {
			throw new ShopifyException("Webhook header is missing", {
				status: 400,
				type: "REQUEST",
			});
		}

		await validateHmac(body, header, "base64");

		// validate.headers
		const requiredHeaders = {
			apiVersion: "X-Shopify-API-Version",
			domain: "X-Shopify-Shop-Domain",
			hmac: "X-Shopify-Hmac-Sha256",
			topic: "X-Shopify-Topic",
			webhookId: "X-Shopify-Webhook-Id",
		};
		if (
			!Object.values(requiredHeaders).every((header) =>
				request.headers.has(header),
			)
		) {
			throw new ShopifyException("Webhook headers are missing", {
				status: 400,
				type: "REQUEST",
			});
		}
		const optionalHeaders = { subTopic: "X-Shopify-Sub-Topic" };
		const headers = { ...requiredHeaders, ...optionalHeaders };
		const webhook = Object.values(headers).reduce(
			(headers, header) => ({
				// biome-ignore lint/performance/noAccumulatingSpread: upstream
				...headers,
				[header]: request.headers.get(header),
			}),
			{} as typeof headers,
		);
		return webhook;
	}

	return {
		admin,
		config,
		proxy,
		redirect,
		session,
		utils,
		webhook,
	};
}

const schema = v.object({
	SHOPIFY_API_KEY: v.pipe(v.string(), v.minLength(32)),
	SHOPIFY_API_SECRET_KEY: v.pipe(v.string(), v.minLength(32)),
	SHOPIFY_APP_HANDLE: v.string(),
	SHOPIFY_APP_LOG_LEVEL: v.optional(
		v.picklist(["debug", "info", "error"]),
		"error",
	),
	SHOPIFY_APP_TEST: v.optional(v.picklist(["0", "1"]), "0"),
	SHOPIFY_APP_URL: v.pipe(v.string(), v.url()),
});

export class ShopifyException extends Error {
	errors?: unknown[];
	status = 500;
	type:
		| "GRAPHQL"
		| "HMAC"
		| "JWT"
		| "REQUEST"
		| "RESPONSE"
		| "SESSION"
		| "SERVER"
		| "SHOP"
		| "THROTTLING" = "SERVER";

	constructor(
		message: string,
		options: ErrorOptions & {
			errors?: unknown[];
			status: number;
			type: string;
		},
	) {
		super(message);

		Object.setPrototypeOf(this, new.target.prototype);
		Object.assign(this, {
			name: this.constructor.name,
			errors: [],
			...(options ?? {}),
		});
	}
}

interface ShopifyJWTPayload extends Required<JWTPayload> {
	dest: string;
}

export class ShopifySession {
	#namespace: KVNamespace;
	#properties = ["accessToken", "expires", "id", "scope", "shop"];

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

	deserialize(data: ShopifySessionSerialized): ShopifySessionObject {
		const obj = Object.fromEntries(
			data
				.filter(([_key, value]) => value !== null && value !== undefined)
				.map(([key, value]) => {
					switch (key.toLowerCase()) {
						case "accesstoken":
							return ["accessToken", value];
						default:
							return [key.toLowerCase(), value];
					}
				}),
		);

		return Object.entries(obj).reduce((session, [key, value]) => {
			switch (key) {
				case "scope":
					session[key] = value.toString();
					break;
				case "expires":
					session[key] = value ? new Date(Number(value)) : undefined;
					break;
				default:
					// biome-ignore lint/suspicious/noExplicitAny: upstream
					(session as any)[key] = value;
					break;
			}
			return session;
		}, {} as ShopifySessionObject);
	}

	async get(id: string | undefined) {
		if (!id) return;

		const data = await this.#namespace.get<[string, string | number][]>(
			id,
			"json",
		);
		return data ? this.deserialize(data) : undefined;
	}

	async set(session: ShopifySessionObject) {
		return this.#namespace.put(
			session.id,
			JSON.stringify(this.serialize(session)),
		);
	}

	serialize(session: ShopifySessionObject): ShopifySessionSerialized {
		return Object.entries(session)
			.filter(
				([key, value]) =>
					this.#properties.includes(key) &&
					value !== undefined &&
					value !== null,
			)
			.flatMap(([key, value]): [string, string | number | boolean][] => {
				switch (key) {
					case "expires":
						return [[key, value ? value.getTime() : undefined]];
					default:
						return [[key, value]];
				}
			})
			.filter(([_key, value]) => value !== undefined);
	}
}
interface ShopifySessionObject {
	id: string;
	shop: string;
	scope: string;
	expires?: Date;
	accessToken: string;
}
type ShopifySessionSerialized = [string, string | number | boolean][];
