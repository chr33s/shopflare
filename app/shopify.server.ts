import {createGraphQLClient} from '@shopify/graphql-client';
import {type JWTPayload, jwtVerify} from 'jose';
import {type AppLoadContext, redirect as routerRedirect} from 'react-router';
import * as v from 'valibot';

import {API_VERSION, APP_BRIDGE_URL} from './const';

export async function admin(context: AppLoadContext, request: Request) {
	async function authenticate() {
		if (request.method === 'OPTIONS') {
			const response = new Response(null, {
				headers: new Headers({
					'Access-Control-Max-Age': '7200',
				}),
				status: 204,
			});
			utils.addCorsHeaders(context, request, response.headers);
			throw response;
		}

		const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY, SHOPIFY_APP_URL} =
			config(context);

		const url = new URL(request.url);
		let encodedSessionToken = null;
		let decodedSessionToken = null;
		try {
			encodedSessionToken =
				request.headers.get('Authorization')?.replace('Bearer ', '') ||
				url.searchParams.get('id_token') ||
				'';

			const {payload} = await jwtVerify<JWTPayload & {dest: string}>(
				encodedSessionToken,
				new TextEncoder().encode(SHOPIFY_API_SECRET_KEY),
				{
					algorithms: ['HS256'],
					clockTolerance: 10,
				},
			);

			// The exp and nbf fields are validated by the JWT library
			if (payload.aud !== SHOPIFY_API_KEY) {
				throw new Exception('Session token had invalid API key', {
					status: 401,
					type: 'JWT',
				});
			}
			decodedSessionToken = payload;
		} catch (error) {
			const isDocumentRequest = !request.headers.has('Authorization');
			if (isDocumentRequest) {
				// Remove `id_token` from the query string to prevent an invalid session token sent to the redirect path.
				url.searchParams.delete('id_token');

				// Using shopify-reload path to redirect the bounce automatically.
				url.searchParams.append(
					'shopify-reload',
					`${SHOPIFY_APP_URL}${url.pathname}?${url.searchParams.toString()}`,
				);
				throw routerRedirect(
					`/shopify/session-token-bounce?${url.searchParams.toString()}`,
				);
			}

			const response = new Response(undefined, {
				headers: new Headers({
					'X-Shopify-Retry-Invalid-Session-Request': '1',
				}),
				status: 401,
				statusText: 'Unauthorized',
			});
			utils.addCorsHeaders(context, request, response.headers);
			throw response;
		}

		const shop = utils.sanitizeShop(new URL(decodedSessionToken.dest).hostname);
		if (!shop) {
			throw new Exception('Received invalid shop argument', {
				status: 400,
				type: 'SHOP',
			});
		}

		const body = {
			client_id: SHOPIFY_API_KEY,
			client_secret: SHOPIFY_API_SECRET_KEY,
			grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
			subject_token: encodedSessionToken,
			subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
			requested_token_type:
				'urn:shopify:params:oauth:token-type:offline-access-token',
		};

		const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json',
			}),
			signal: AbortSignal.timeout(1_000),
		});
		if (!response.ok) {
			const body: any = await response.json();
			if (typeof response === 'undefined') {
				const message = body?.errors?.message ?? '';
				throw new Exception(
					`Http request error, no response available: ${message}`,
					{
						status: 400,
						type: 'REQUEST',
					},
				);
			}

			if (response.status === 200 && body.errors.graphQLErrors) {
				throw new Exception(
					body.errors.graphQLErrors?.[0].message ?? 'GraphQL operation failed',
					{
						status: 400,
						type: 'GRAPHQL',
					},
				);
			}

			const errorMessages: string[] = [];
			if (body.errors) {
				errorMessages.push(JSON.stringify(body.errors, null, 2));
			}
			const xRequestId = response.headers.get('x-request-id');
			if (xRequestId) {
				errorMessages.push(
					`If you report this error, please include this id: ${xRequestId}`,
				);
			}

			const errorMessage = errorMessages.length
				? `:\n${errorMessages.join('\n')}`
				: '';

			switch (true) {
				case response.status === 429: {
					throw new Exception(
						`Shopify is throttling requests ${errorMessage}`,
						{
							status: response.status,
							type: 'THROTTLING',
							// retryAfter: response.headers.has("Retry-After") ? parseFloat(response.headers.get("Retry-After")) : undefined,
						},
					);
				}
				case response.status >= 500:
					throw new Exception(`Shopify internal error${errorMessage}`, {
						status: response.status,
						type: 'SERVER',
					});
				default:
					throw new Exception(
						`Received an error response (${response.status} ${response.statusText}) from Shopify${errorMessage}`,
						{
							status: response.status,
							type: 'RESPONSE',
						},
					);
			}
		}

		const accessTokenResponse = await response.json<{
			access_token: string;
			expires_in?: number;
			scope: string;
		}>();
		await session(context).set(shop, {
			id: shop,
			shop,
			scope: accessTokenResponse.scope,
			expires: accessTokenResponse.expires_in
				? new Date(Date.now() + accessTokenResponse.expires_in * 1000)
				: undefined,
			accessToken: accessTokenResponse.access_token,
		});

		const current = await session(context).get(shop);
		if (!current)
			throw new Exception('No session found', {status: 401, type: 'SESSION'});
		return {
			client: client(current).admin(),
			session: current,
		};
	}

	const authenticated = await authenticate();
	return authenticated;
}

export function client({
	accessToken,
	apiVersion = API_VERSION,
	shop,
}: Record<'accessToken' | 'shop', string> &
	Partial<Record<'apiVersion', string>>) {
	type Headers = Record<string, string | string[]>;

	function client({url, headers}: {url: string; headers: Headers}) {
		return createGraphQLClient({
			customFetchApi: fetch,
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
			url,
		});
	}

	function admin(headers?: Headers) {
		return client({
			url: `https://${shop}/admin/api/${apiVersion}/graphql.json`,
			headers: {
				'X-Shopify-Access-Token': accessToken,
				...headers,
			},
		});
	}

	function storefront(headers?: Headers) {
		return client({
			url: `https://${shop}/api/${apiVersion}/graphql.json`,
			headers: {
				'X-Shopify-Storefront-Access-Token': accessToken,
				...headers,
			},
		});
	}

	return {
		admin,
		storefront,
	};
}

export function config(context: AppLoadContext) {
	const schema = v.object({
		SHOPIFY_API_KEY: v.pipe(v.string(), v.minLength(32)),
		SHOPIFY_API_SECRET_KEY: v.pipe(v.string(), v.minLength(32)),
		SHOPIFY_APP_HANDLE: v.string(),
		SHOPIFY_APP_LOG_LEVEL: v.optional(
			v.picklist(['debug', 'info', 'error']),
			'error',
		),
		SHOPIFY_APP_TEST: v.optional(v.picklist(['0', '1']), '0'),
		SHOPIFY_APP_URL: v.pipe(v.string(), v.url()),
	});

	const config = v.parse(schema, context.cloudflare.env);
	return config;
}

type Config = ReturnType<typeof config>;

// NOTE: compatibility
export function createShopify(context: AppLoadContext) {
	return {
		admin: (request: Request) =>
			admin(context, request).then(({client}) => client),
		config: config(context),
		proxy: (request: Request) =>
			proxy(context, request).then(({client}) => client),
		redirect,
		session: session(context),
		utils: {
			...utils,
			addCorsHeaders: (request: Request, responseHeaders: Headers) =>
				utils.addCorsHeaders(context, request, responseHeaders),
			log: log(config(context).SHOPIFY_APP_LOG_LEVEL),
			validateHmac: (data: string, hmac: string, encoding: UtilEncoding) =>
				utils.validateHmac(context, {data, hmac, encoding}),
		},
		webhook: (request: Request) =>
			webhook(context, request).then(({webhook}) => webhook),
	};
}

// NOTE: compatibility
export function createShopifyClient({
	apiVersion = API_VERSION,
	headers,
	shop,
}: {
	apiVersion?: string;
	headers: Record<string, string | string[]>;
	shop: string;
}) {
	const admin = 'X-Shopify-Access-Token';
	const storefront = 'X-Shopify-Storefront-Access-Token';
	if (!headers[admin] && !headers[storefront]) {
		throw new Exception(`Missing auth header [${admin}, ${storefront}]`, {
			status: 401,
			type: 'REQUEST',
		});
	}

	const accessToken = (headers[admin] ?? headers[storefront]) as string;
	return client({
		accessToken,
		apiVersion,
		shop,
	})[headers[storefront] ? 'storefront' : 'admin'](headers);
}

export class Exception extends Error {
	errors?: unknown[];
	status = 500;
	type:
		| 'GRAPHQL'
		| 'HMAC'
		| 'JWT'
		| 'REQUEST'
		| 'RESPONSE'
		| 'SESSION'
		| 'SERVER'
		| 'SHOP'
		| 'THROTTLING' = 'SERVER';

	constructor(
		message: string,
		options?: ErrorOptions & {
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

export function log(level: Config['SHOPIFY_APP_LOG_LEVEL']) {
	const log = {
		error: 0,
		info: 1,
		debug: 2,
	};

	function noop() {}

	return {
		debug(...args: unknown[]) {
			if (log[level] >= log.debug) {
				return console.debug('log.debug', ...args);
			}
			return noop;
		},

		info(...args: unknown[]) {
			if (log[level] >= log.info) {
				return console.info('log.info', ...args);
			}
			return noop;
		},

		error(...args: unknown[]) {
			if (log[level] >= log.error) {
				return console.error('log.error', ...args);
			}
			return noop;
		},
	};
}

export async function proxy(context: AppLoadContext, request: Request) {
	async function authenticate() {
		const url = new URL(request.url);

		const hmac = url.searchParams.get('signature');
		if (!hmac) {
			throw new Exception('Proxy signature param is missing', {
				status: 400,
				type: 'REQUEST',
			});
		}

		const timestamp = Number(url.searchParams.get('timestamp'));
		if (
			// HMAC_TIMESTAMP_PERMITTED_CLOCK_TOLERANCE_SEC
			Math.abs(Math.trunc(Date.now() / 1000) - timestamp) > 90
		) {
			throw new Exception('Proxy timestamp param is expired', {
				status: 400,
				type: 'REQUEST',
			});
		}

		// NOTE: https://shopify.dev/docs/apps/build/online-store/display-dynamic-data#calculate-a-digital-signature
		const data = Object.entries(Object.fromEntries(url.searchParams))
			.filter(([key]) => key !== 'signature')
			.map(
				([key, value]) =>
					`${key}=${Array.isArray(value) ? value.join(',') : value}`,
			)
			.sort((a, b) => a.localeCompare(b))
			.join('');

		const valid = await utils.validateHmac(context, {
			data,
			hmac,
			encoding: 'hex',
		});
		if (!valid) {
			throw new Exception('Invalid hmac', {
				status: 401,
				type: 'HMAC',
			});
		}

		// shop is value due to hmac validation
		const shop = utils.sanitizeShop(url.searchParams.get('shop'));
		if (!shop)
			throw new Exception('No shop param', {status: 400, type: 'REQUEST'});

		const current = await session(context).get(shop);
		if (!current)
			throw new Exception('No session found', {status: 401, type: 'SESSION'});
		return {
			client: client(current).admin(),
			session: current,
		};
	}

	const authenticated = await authenticate();
	return authenticated;
}

export async function redirect(
	context: AppLoadContext,
	request: Request,
	{
		shop,
		url,
		target,
		...init
	}: ResponseInit & {
		url: string;
		shop: string;
		target?: '_self' | '_parent' | '_blank' | '_top';
	},
) {
	const headers = new Headers({
		'content-type': 'text/html;charset=utf-8',
		...init.headers,
	});

	const {SHOPIFY_API_KEY, SHOPIFY_APP_URL} = config(context);

	let windowTarget = target ?? '_self';
	let windowUrl = new URL(url, SHOPIFY_APP_URL);

	const isSameOrigin = SHOPIFY_APP_URL === windowUrl.origin;
	const isRelativePath = url.startsWith('/');
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
		const shopHandle = shop.replace('.myshopify.com', '');
		const adminUri = url.replace(adminLinkRegExp, '/');
		windowUrl = new URL(
			`https://admin.shopify.com/store/${shopHandle}${adminUri}`,
		);

		const remove = [
			// sent when clicking rel="home" nav item
			'appLoadId',
			'hmac',
			'host',
			'embedded',
			'id_token',
			'locale',
			'protocol',
			'session',
			'shop',
			'timestamp',
		];
		for (const param of remove) {
			if (windowUrl.searchParams.has(param)) {
				windowUrl.searchParams.delete(param);
			}
		}

		if (!target) {
			windowTarget = '_parent';
		}
	}

	switch (true) {
		case target === '_self' && isBounce(request):
		case target !== '_self' && isEmbedded(request): {
			const response = new Response(
				/* html */ `<head>
					<script data-api-key="${SHOPIFY_API_KEY}" src="${APP_BRIDGE_URL}" />
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
			utils.addCorsHeaders(context, request, response.headers);
			throw response;
		}

		case isData(request): {
			const response = new Response(undefined, {
				headers: new Headers({
					'X-Shopify-API-Request-Failure-Reauthorize-Url': windowUrl.toString(),
				}),
				status: 401,
				statusText: 'Unauthorized',
			});
			utils.addCorsHeaders(context, request, response.headers);
			throw response;
		}

		default: {
			throw routerRedirect(url, init);
		}
	}

	function authorizationHeader(request: Request) {
		return request.headers.get('authorization')?.replace(/Bearer\s?/, '');
	}

	function isBounce(request: Request) {
		return (
			Boolean(authorizationHeader(request)) &&
			request.headers.has('X-Shopify-Bounce')
		);
	}

	function isData(request: Request) {
		return (
			Boolean(authorizationHeader(request)) &&
			!isBounce(request) &&
			(!isEmbedded(request) || request.method !== 'GET')
		);
	}

	function isEmbedded(request: Request) {
		return new URL(request.url).searchParams.get('embedded') === '1';
	}
}

export function session(context: AppLoadContext) {
	const kv = context.cloudflare.env.SESSION_STORAGE;

	async function get(id: string) {
		if (!id) return;
		return kv.get<Session>(id, 'json');
	}

	async function set(id: string, data: Session | null) {
		if (data === null) return kv.delete(id);
		if (!data) return;
		return kv.put(id, JSON.stringify(data));
	}

	return {
		get,
		set,
	};
}

export interface Session {
	id: string;
	shop: string;
	scope: string;
	expires?: Date;
	accessToken: string;
}

type UtilEncoding = 'base64' | 'hex';

export const utils = {
	addCorsHeaders(
		context: AppLoadContext,
		request: Request,
		responseHeaders: Headers,
	) {
		const origin = request.headers.get('Origin');
		if (origin && origin !== config(context).SHOPIFY_APP_URL) {
			if (!responseHeaders.has('Access-Control-Allow-Headers')) {
				responseHeaders.set('Access-Control-Allow-Headers', 'Authorization');
			}
			if (!responseHeaders.has('Access-Control-Allow-Origin')) {
				responseHeaders.set('Access-Control-Allow-Origin', origin);
			}
			if (responseHeaders.get('Access-Control-Allow-Origin') !== '*') {
				responseHeaders.set('Vary', 'Origin');
			}
			if (!responseHeaders.has('Access-Control-Expose-Headers')) {
				responseHeaders.set(
					'Access-Control-Expose-Headers',
					'X-Shopify-API-Request-Failure-Reauthorize-Url',
				);
			}
		}
	},

	addHeaders(request: Request, responseHeaders: Headers) {
		const url = new URL(request.url);
		const shop = utils.sanitizeShop(url.searchParams.get('shop'));
		if (shop && !url.pathname.startsWith('/apps')) {
			responseHeaders.set(
				'Link',
				`<${APP_BRIDGE_URL}>; rel="preload"; as="script";`,
			);
		}
	},

	allowedDomains: ['myshopify.com', 'myshopify.io', 'shop.dev', 'shopify.com']
		// escape
		.map((v) => v.replace(/\./g, '\\.'))
		.join('|'),

	encode(value: ArrayBuffer, encoding: UtilEncoding) {
		switch (encoding) {
			case 'base64':
				return btoa(String.fromCharCode(...new Uint8Array(value)));

			case 'hex':
				return [...new Uint8Array(value)].reduce(
					(a, b) => a + b.toString(16).padStart(2, '0'),
					'',
				);
		}
	},

	legacyUrlToShopAdminUrl(shop: string) {
		const shopUrl = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
		const regExp = /(.+)\.myshopify\.com$/;

		const matches = shopUrl.match(regExp);
		if (matches && matches.length === 2) {
			const shopName = matches[1];
			return `admin.shopify.com/store/${shopName}`;
		}
		return null;
	},

	sanitizeHost(host: string | null) {
		if (!host) return null;

		const base64RegExp = /^[0-9a-z+/]+={0,2}$/i;
		let sanitizedHost = base64RegExp.test(host) ? host : null;
		if (sanitizedHost) {
			const {hostname} = new URL(`https://${atob(sanitizedHost)}`);

			const hostRegExp = new RegExp(`\\.(${utils.allowedDomains})$`);
			if (!hostRegExp.test(hostname)) {
				sanitizedHost = null;
			}
		}
		return sanitizedHost;
	},

	sanitizeShop(shop: string | null) {
		if (!shop) return null;

		let sanitizedShop = shop;

		const shopAdminRegExp = new RegExp(
			`^admin\\.(${utils.allowedDomains})/store/([a-zA-Z0-9][a-zA-Z0-9-_]*)$`,
		);
		if (shopAdminRegExp.test(shop)) {
			sanitizedShop = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
			if (sanitizedShop.split('.').at(0) !== 'admin') {
				return null;
			}

			const regex = /admin\..+\/store\/([^/]+)/;
			const matches = sanitizedShop.match(regex);
			if (matches && matches.length === 2) {
				sanitizedShop = `${matches.at(1)}.myshopify.com`;
			} else {
				return null;
			}
		}

		const shopRegExp = new RegExp(
			`^[a-zA-Z0-9][a-zA-Z0-9-_]*\\.(${utils.allowedDomains})[/]*$`,
		);
		if (!shopRegExp.test(sanitizedShop)) return null;

		return sanitizedShop;
	},

	async validateHmac(
		context: AppLoadContext,
		request: {data: string; hmac: string; encoding: UtilEncoding},
	) {
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			'raw',
			encoder.encode(config(context).SHOPIFY_API_SECRET_KEY),
			{
				name: 'HMAC',
				hash: 'SHA-256',
			},
			false,
			['sign'],
		);
		const signature = await crypto.subtle.sign(
			'HMAC',
			key,
			encoder.encode(request.data),
		);

		const computed = utils.encode(signature, request.encoding);
		const bufA = encoder.encode(computed);
		const bufB = encoder.encode(request.hmac);
		if (bufA.byteLength !== bufB.byteLength) return false;

		const valid = (crypto.subtle as any).timingSafeEqual(bufA, bufB) as boolean;
		return valid;
	},
};

export async function webhook(context: AppLoadContext, request: Request) {
	async function authenticate() {
		const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
		if (!hmac) {
			throw new Exception('Webhook header is missing', {
				status: 400,
				type: 'REQUEST',
			});
		}

		const data = await request.clone().text();
		if (data.length === 0) {
			throw new Exception('Webhook body is missing', {
				status: 400,
				type: 'REQUEST',
			});
		}

		const valid = await utils.validateHmac(context, {
			data,
			hmac,
			encoding: 'base64',
		});
		if (!valid) {
			throw new Exception('Invalid hmac', {
				status: 401,
				type: 'HMAC',
			});
		}

		const requiredHeaders = {
			apiVersion: 'X-Shopify-API-Version',
			domain: 'X-Shopify-Shop-Domain',
			hmac: 'X-Shopify-Hmac-Sha256',
			topic: 'X-Shopify-Topic',
			webhookId: 'X-Shopify-Webhook-Id',
		};
		if (
			!Object.values(requiredHeaders).every((header) =>
				request.headers.get(header),
			)
		) {
			throw new Exception('Webhook required header is missing', {
				status: 400,
				type: 'REQUEST',
			});
		}
		const optionalHeaders = {subTopic: 'X-Shopify-Sub-Topic'};
		const headers = {...requiredHeaders, ...optionalHeaders};
		const webhook = Object.entries(headers).reduce(
			(headers, [key, value]) => ({
				...headers,
				[key]: request.headers.get(value),
			}),
			{} as typeof headers,
		);

		const current = await session(context).get(webhook.domain);
		if (!current) {
			throw new Exception('No session found', {status: 401, type: 'SESSION'});
		}

		return {
			client: client(current),
			session: current,
			webhook: {
				payload: JSON.parse(data),
				...webhook,
			},
		};
	}

	const authenticated = await authenticate();
	return authenticated;
}
