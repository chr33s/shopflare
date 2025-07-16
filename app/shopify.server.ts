import {type GraphQLClient, createGraphQLClient} from '@shopify/graphql-client';
import {type JWTPayload, jwtVerify} from 'jose';
import {
	type AppLoadContext,
	data,
	redirect as routerRedirect,
} from 'react-router';
import * as z from 'zod/mini';

import type {
	MutationBulkOperationRunMutationArgs,
	MutationBulkOperationRunQueryArgs,
	MetafieldDefinitionIdentifierInput,
	MetafieldDefinitionInput,
	MetafieldInput,
	MetafieldsSetInput,
	MetaobjectDefinition,
	MetaobjectHandleInput,
	MetaobjectUpsertInput,
	StagedMediaUploadTarget,
} from '~/types/admin.types';
import type {
	BillingCheckQuery,
	BulkOperationCancelMutation,
	BulkOperationRunMutationMutation,
	BulkOperationRunQueryMutation,
	CurrentBulkOperationQuery,
	FileCreateMutation,
	FileQuery,
	MetafieldDefinitionUpdateMutation,
	MetafieldDefinitionCreateMutation,
	MetafieldDeleteMutation,
	MetafieldDefinitionQuery,
	MetafieldQuery,
	MetafieldsQuery,
	MetaobjectDefinitionCreateMutation,
	MetaobjectDefinitionDeleteMutation,
	MetaobjectDefinitionQuery,
	MetaobjectDefinitionUpdateMutation,
	MetaobjectDeleteMutation,
	MetaobjectQuery,
	MetaobjectsQuery,
	MetaobjectUpsertMutation,
	StagedUploadsCreateMutation,
	MetafieldDefinitionDeleteMutation,
	MetafieldsSetMutation,
} from '~/types/admin.generated';

import {API_VERSION, APP_BRIDGE_URL, APP_HANDLE, APP_LOG_LEVEL} from './const';

export async function admin(context: Context, request: Request) {
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
					type: 'REQUEST',
				});
			}
			decodedSessionToken = payload;
		} catch {
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
				type: 'REQUEST',
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
						type: 'RESPONSE',
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
							type: 'RESPONSE',
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
			throw new Exception('No session found', {
				status: 401,
				type: 'REQUEST',
			});
		return {
			client: client(current).admin(),
			session: current,
		};
	}

	const authenticated = await authenticate();
	return authenticated;
}

export function billing(context: Context, request: Request) {
	async function check(plans: string[]) {
		const shop = utils.sanitizeShop(
			new URL(request.url).searchParams.get('shop'),
		)!;

		if (await active(shop, plans)) return;

		return redirect(context, request, {
			shop,
			url: `shopify://admin/charges/${APP_HANDLE}/pricing_plans`,
		});
	}

	return {check};

	async function active(shop: string, plans: string[]) {
		const isTest = config(context).SHOPIFY_APP_TEST === '1';

		const current = await session(context, 'admin').get(shop);
		const admin = client({
			accessToken: current?.accessToken!,
			shop,
		}).admin();

		let cursor: string | undefined;
		while (true) {
			const {data, errors} = await admin.request<BillingCheckQuery>(
				/* GraphQL */ `
					#graphql
					query BillingCheck($cursor: String) {
						currentAppInstallation {
							activeSubscriptions {
								id
								name
								test
								status
							}
							oneTimePurchases(
								first: 250
								sortKey: CREATED_AT
								after: $cursor
							) {
								nodes {
									id
									name
									test
									status
								}
								pageInfo {
									hasNextPage
									endCursor
								}
							}
						}
					}
				`,
				{variables: {cursor}},
			);
			if (errors || !data) {
				throw new Exception(errors?.message ?? 'Unknown server error', {
					status: errors?.networkStatusCode ?? 500,
					type: errors?.networkStatusCode ? 'RESPONSE' : 'SERVER',
				});
			}

			const {activeSubscriptions, oneTimePurchases} =
				data.currentAppInstallation;
			if (
				[...activeSubscriptions, ...oneTimePurchases.nodes].some(
					(plan) =>
						plans.includes(plan.name) &&
						plan.status === 'ACTIVE' &&
						plan.test === isTest,
				)
			) {
				return true;
			}

			const {pageInfo} = oneTimePurchases;
			if (pageInfo.hasNextPage && pageInfo.endCursor) {
				cursor = pageInfo.endCursor;
				continue;
			}
			return false;
		}
	}
}

export function bulkOperation(client: Client) {
	async function query(query: string) {
		await runQuery({query});
		await process('QUERY');
		return download('QUERY');
	}

	async function mutation(mutation: string, variables: object[]) {
		const buffer = utils.JSONL.stringify(variables);
		const digest = await crypto.subtle.digest(
			{name: 'SHA-1'},
			new TextEncoder().encode(JSON.stringify(variables)),
		);
		const key = utils.encode(digest, 'hex');
		const filename = `shopflare.variables.${key}.jsonl`;
		const file = new File([buffer], filename, {type: 'text/jsonl'});

		const target = await upload(client).target(file);
		const stagedUploadPath = target.parameters.find(
			(v) => v.name === 'key',
		)!.value;

		await runMutation({mutation, stagedUploadPath});
		await process('MUTATION');
		return download('MUTATION');
	}

	return {
		query,
		mutation,
	};

	// @ts-expect-error needed spec compliance
	// eslint-disable-next-line no-unused-vars
	async function cancel(id: string) {
		return client
			.request<BulkOperationCancelMutation>(
				/* GraphQL */ `
					#graphql
					mutation BulkOperationCancel($id: ID!) {
						bulkOperationCancel(id: $id) {
							bulkOperation {
								errorCode
								id
								status
								type
							}
							userErrors {
								field
								message
							}
						}
					}
				`,
				{variables: {id}},
			)
			.then((res) => res.data?.bulkOperationCancel);
	}

	async function current(type: BulkOperationType) {
		return client
			.request<CurrentBulkOperationQuery>(
				/* GraphQL */ `
					#graphql
					query CurrentBulkOperation($type: BulkOperationType!) {
						currentBulkOperation(type: $type) {
							errorCode
							id
							type
							status
							url
						}
					}
				`,
				{variables: {type}},
			)
			.then((res) => res.data?.currentBulkOperation);
	}

	async function runMutation(args: MutationBulkOperationRunMutationArgs) {
		return client
			.request<BulkOperationRunMutationMutation>(
				/* GraphQL */ `
					#graphql
					mutation BulkOperationRunMutation(
						$clientIdentifier: String
						$groupObjects: Boolean!
						$mutation: String!
						$stagedUploadPath: String!
					) {
						bulkOperationRunMutation(
							clientIdentifier: $clientIdentifier
							groupObjects: $groupObjects
							mutation: $mutation
							stagedUploadPath: $stagedUploadPath
						) {
							bulkOperation {
								errorCode
								id
								partialDataUrl
								status
								type
								url
							}
							userErrors {
								field
								message
							}
						}
					}
				`,
				{
					variables: {
						clientIdentifier: 'shopflare',
						groupObjects: false,
						...args,
					},
				},
			)
			.then((res) => res.data?.bulkOperationRunMutation);
	}

	async function runQuery(args: MutationBulkOperationRunQueryArgs) {
		return client
			.request<BulkOperationRunQueryMutation>(
				/* GraphQL */ `
					#graphql
					mutation BulkOperationRunQuery(
						$groupObjects: Boolean!
						$query: String!
					) {
						bulkOperationRunQuery(groupObjects: $groupObjects, query: $query) {
							bulkOperation {
								errorCode
								id
								partialDataUrl
								status
								type
								url
							}
							userErrors {
								field
								message
							}
						}
					}
				`,
				{
					variables: {
						groupObjects: false,
						...args,
					},
				},
			)
			.then((res) => res.data?.bulkOperationRunQuery);
	}

	async function download(type: BulkOperationType) {
		await process(type);

		const data = await current(type);
		if (!data?.url) return;

		const file = await fetch(data.url);
		if (!file.ok) return;

		const text = await file.text();

		const json = utils.JSONL.parse(text);
		for (const obj of json) {
			if (Object.prototype.toString.call(obj) !== '[object Object]') continue;
			if (obj.__parentId) continue;

			const parent = json.find((v) => v.id === obj.__parentId)!;
			const parentKey = parent.id.split('/').at(3);

			const child = Object.fromEntries(
				Object.entries(obj).filter(([key]) => key !== '__parentId'),
			);
			const childKey = obj.id
				.split('/')
				.at(3)
				?.replace(parentKey!, '')
				.toLocaleLowerCase()
				.concat('s')!;

			parent[childKey] ??= [];
			if (!Array.isArray(parent[childKey])) continue;
			parent[childKey].push(child);
		}
		return json.filter((v) => !v.__parentId);
	}

	async function process(type: BulkOperationType) {
		while (true) {
			const data = await current(type);
			const status = data?.status ?? '';
			if (['CANCELING', 'CREATED', 'RUNNING'].includes(status)) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				continue;
			}
			break;
		}
	}
}

export type BulkOperationType = 'QUERY' | 'MUTATION';

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
			logger: (...args: unknown[]) => log.debug(...args),
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

export type Client = GraphQLClient;

export function config(context: Context) {
	const schema = z.object({
		SHOPIFY_API_KEY: z.string().check(z.minLength(32)),
		SHOPIFY_API_SECRET_KEY: z.string().check(z.minLength(32)),
		SHOPIFY_APP_HANDLE: z.string().check(z.minLength(1)),
		SHOPIFY_APP_TEST: z._default(z.enum(['0', '1']), '0'),
		SHOPIFY_APP_URL: z.string().check(z.url()),
	});

	const config = schema.parse(context.cloudflare.env);
	return config;
}

export type Context = AppLoadContext;

// NOTE: @deprecated
export function createShopify(context: Context) {
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
			log,
			validateHmac: (data: string, hmac: string, encoding: UtilEncoding) =>
				utils.validateHmac(context, {data, hmac, encoding}),
		},
		webhook: (request: Request) =>
			webhook(context, request).then(({webhook}) => webhook),
	};
}

// NOTE: @deprecated
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
	type: 'REQUEST' | 'RESPONSE' | 'SERVER' = 'SERVER';

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

export async function handler<T>(fn: () => Promise<T>) {
	try {
		return fn();
	} catch (error) {
		if (error instanceof Response) return error;
		if (error instanceof Exception) {
			switch (error.type) {
				case 'RESPONSE': {
					return {
						data: undefined,
						errors: error.errors,
					};
				}

				default: {
					return new Response(error.message, {
						status: error.status,
					});
				}
			}
		}
		return data(
			{
				data: undefined,
				errors: [{message: 'Unknown Error'}],
			},
			500,
		);
	}
}

export const log = {
	level: APP_LOG_LEVEL as 'error' | 'info' | 'debug',
	levels: {
		error: 0,
		info: 1,
		debug: 2,
	},
	noop() {},

	debug(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.debug) {
			return console.debug('log.debug', ...args);
		}
		return this.noop();
	},

	info(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.info) {
			return console.info('log.info', ...args);
		}
		return this.noop;
	},

	error(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.error) {
			return console.error('log.error', ...args);
		}
		return this.noop;
	},
};

export function metafield(client: Client) {
	function definition() {
		async function get(identifier: MetafieldDefinitionIdentifierInput) {
			return client
				.request<MetafieldDefinitionQuery>(
					/* GraphQL */ `
						#graphql
						query MetafieldDefinition(
							$identifier: MetafieldDefinitionIdentifierInput!
						) {
							metafieldDefinition(identifier: $identifier) {
								id
							}
						}
					`,
					{variables: {identifier}},
				)
				.then((res) => res.data?.metafieldDefinition);
		}

		async function set(
			identifier: MetafieldDefinitionIdentifierInput,
			definition: Omit<
				MetafieldDefinitionInput,
				'key' | 'namespace' | 'ownerType'
			> | null,
		) {
			if (definition === null) {
				return destroy(identifier);
			}
			const existing = await get(identifier);
			return existing
				? update({...identifier, ...definition})
				: create({...identifier, ...definition});
		}

		return {
			get,
			set,
		};

		async function create(definition: MetafieldDefinitionInput) {
			return client
				.request<MetafieldDefinitionCreateMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetafieldDefinitionCreate(
							$definition: MetafieldDefinitionInput!
						) {
							metafieldDefinitionCreate(definition: $definition) {
								createdDefinition {
									id
									name
								}
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{variables: {definition}},
				)
				.then((res) => res.data?.metafieldDefinitionCreate);
		}

		async function update(definition: MetafieldDefinitionInput) {
			return client
				.request<MetafieldDefinitionUpdateMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetafieldDefinitionUpdate(
							$definition: MetafieldDefinitionUpdateInput!
						) {
							metafieldDefinitionUpdate(definition: $definition) {
								updatedDefinition {
									id
									name
								}
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{variables: {definition}},
				)
				.then((res) => res.data?.metafieldDefinitionUpdate);
		}

		async function destroy(
			identifier: MetafieldDefinitionIdentifierInput,
			cascade = false,
		) {
			return client
				.request<MetafieldDefinitionDeleteMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetafieldDefinitionDelete(
							$identifier: MetafieldDefinitionIdentifierInput!
							$deleteAllAssociatedMetafields: Boolean!
						) {
							metafieldDefinitionDelete(
								identifier: $identifier
								deleteAllAssociatedMetafields: $deleteAllAssociatedMetafields
							) {
								deletedDefinitionId
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{
						variables: {
							identifier,
							deleteAllAssociatedMetafields: cascade,
						},
					},
				)
				.then((res) => res.data?.metafieldDefinitionDelete);
		}
	}

	async function get(identifier: MetafieldGetOne): ReturnType<typeof getOne>;
	async function get(identifier: MetafieldGetAll): ReturnType<typeof getAll>;
	async function get(identifier: MetafieldGetOne | MetafieldGetAll) {
		return 'key' in identifier ? getOne(identifier) : getAll(identifier);
	}

	async function set(
		identifier: MetafieldInput,
		metafield: Omit<
			MetafieldsSetInput,
			'key' | 'namespace' | 'ownerId' | 'value'
		> & {value: MetafieldsSetInput['value'] | null},
	) {
		if (metafield === null) return destroy(identifier);

		return client
			.request<MetafieldsSetMutation>(
				/* GraphQL */ `
					#graphql
					mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
						metafieldsSet(metafields: $metafields) {
							metafields {
								key
								namespace
								value
								createdAt
								updatedAt
							}
							userErrors {
								code
								field
								message
							}
						}
					}
				`,
				{variables: {metafields: [{...identifier, ...metafield}]}},
			)
			.then((res) => res.data?.metafieldsSet);
	}

	return {
		definition,
		get,
		set,
	};

	async function destroy(identifier: MetafieldInput) {
		return client
			.request<MetafieldDeleteMutation>(
				/* GraphQL */ `
					#graphql
					mutation MetafieldDelete($metafields: [MetafieldIdentifierInput!]!) {
						metafieldsDelete(metafields: $metafields) {
							deletedMetafields {
								key
								namespace
								ownerId
							}
							userErrors {
								field
								message
							}
						}
					}
				`,
				{variables: {metafields: [identifier]}},
			)
			.then((res) => res.data?.metafieldsDelete);
	}

	async function getAll(identifier: MetafieldGetAll) {
		return client
			.request<MetafieldsQuery>(
				/* GraphQL */ `
					#graphql
					fragment MetafieldNodesFragment on HasMetafields {
						metafields(
							after: $cursor
							first: $first
							keys: $keys
							namespace: $namespace
						) {
							nodes {
								id
								key
								namespace
								value
							}
						}
					}

					query Metafields(
						$cursor: String
						$first: Int = 10
						$keys: [String!]
						$namespace: String
						$ownerId: ID!
					) {
						node(id: $ownerId) {
							... on AppInstallation {
								...MetafieldNodesFragment
							}
							... on Article {
								...MetafieldNodesFragment
							}
							... on Blog {
								...MetafieldNodesFragment
							}
							... on Collection {
								...MetafieldNodesFragment
							}
							... on Company {
								...MetafieldNodesFragment
							}
							... on CompanyLocation {
								...MetafieldNodesFragment
							}
							... on Customer {
								...MetafieldNodesFragment
							}
							... on DeliveryCustomization {
								...MetafieldNodesFragment
							}
							... on DiscountAutomaticNode {
								...MetafieldNodesFragment
							}
							... on DiscountCodeNode {
								...MetafieldNodesFragment
							}
							... on DiscountNode {
								...MetafieldNodesFragment
							}
							... on DraftOrder {
								...MetafieldNodesFragment
							}
							... on Location {
								...MetafieldNodesFragment
							}
							... on Market {
								...MetafieldNodesFragment
							}
							... on Order {
								...MetafieldNodesFragment
							}
							... on Page {
								...MetafieldNodesFragment
							}
							... on PaymentCustomization {
								...MetafieldNodesFragment
							}
							... on Product {
								...MetafieldNodesFragment
							}
							... on ProductVariant {
								...MetafieldNodesFragment
							}
							... on Shop {
								...MetafieldNodesFragment
							}
						}
					}
				`,
				{variables: identifier},
			)
			.then((res) => res.data?.node?.metafields.nodes);
	}

	async function getOne(identifier: MetafieldGetOne) {
		return client
			.request<MetafieldQuery>(
				/* GraphQL */ `
					#graphql
					fragment MetafieldNodeFragment on HasMetafields {
						metafield(key: $key, namespace: $namespace) {
							id
							key
							namespace
							value
						}
					}

					query Metafield($key: String!, $namespace: String, $ownerId: ID!) {
						node(id: $ownerId) {
							... on AppInstallation {
								...MetafieldNodeFragment
							}
							... on Article {
								...MetafieldNodeFragment
							}
							... on Blog {
								...MetafieldNodeFragment
							}
							... on Collection {
								...MetafieldNodeFragment
							}
							... on Company {
								...MetafieldNodeFragment
							}
							... on CompanyLocation {
								...MetafieldNodeFragment
							}
							... on Customer {
								...MetafieldNodeFragment
							}
							... on DeliveryCustomization {
								...MetafieldNodeFragment
							}
							... on DiscountAutomaticNode {
								...MetafieldNodeFragment
							}
							... on DiscountCodeNode {
								...MetafieldNodeFragment
							}
							... on DiscountNode {
								...MetafieldNodeFragment
							}
							... on DraftOrder {
								...MetafieldNodeFragment
							}
							... on Location {
								...MetafieldNodeFragment
							}
							... on Market {
								...MetafieldNodeFragment
							}
							... on Order {
								...MetafieldNodeFragment
							}
							... on Page {
								...MetafieldNodeFragment
							}
							... on PaymentCustomization {
								...MetafieldNodeFragment
							}
							... on Product {
								...MetafieldNodeFragment
							}
							... on ProductVariant {
								...MetafieldNodeFragment
							}
							... on Shop {
								...MetafieldNodeFragment
							}
						}
					}
				`,
				{variables: identifier},
			)
			.then((res) => res.data?.node?.metafield);
	}
}

export interface MetafieldGetAll {
	cursor?: string;
	first?: number;
	keys?: string[];
	namespace?: string;
	ownerId: string;
}

export interface MetafieldGetOne {
	key: string;
	namespace?: string;
	ownerId: string;
}

export function metaobject(client: Client) {
	function definition() {
		async function get(id: string) {
			return client
				.request<MetaobjectDefinitionQuery>(
					/* GraphQL */ `
						#graphql
						query MetaobjectDefinition($id: ID!) {
							metaobjectDefinition(id: $id) {
								id
							}
						}
					`,
					{variables: {id}},
				)
				.then((res) => res.data?.metaobjectDefinition);
		}

		async function set(
			id: string,
			definition: Omit<MetaobjectDefinition, 'id'> | null,
		) {
			if (definition === null) {
				return destroy(id);
			}
			const existing = await get(id);
			return existing ? update({id, ...definition}) : create(definition);
		}

		return {
			get,
			set,
		};

		async function create(definition: Omit<MetaobjectDefinition, 'id'>) {
			return client
				.request<MetaobjectDefinitionCreateMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetaobjectDefinitionCreate(
							$definition: MetaobjectDefinitionCreateInput!
						) {
							metaobjectDefinitionCreate(definition: $definition) {
								metaobjectDefinition {
									name
									type
									fieldDefinitions {
										name
										key
									}
								}
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{variables: {definition}},
				)
				.then((res) => res.data?.metaobjectDefinitionCreate);
		}

		async function update(definition: MetaobjectDefinition) {
			return client
				.request<MetaobjectDefinitionUpdateMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetaobjectDefinitionUpdate(
							$id: ID!
							$definition: MetaobjectDefinitionUpdateInput!
						) {
							metaobjectDefinitionUpdate(id: $id, definition: $definition) {
								metaobjectDefinition {
									id
									name
									displayNameKey
									fieldDefinitions {
										name
										key
										type {
											name
										}
									}
								}
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{variables: {definition}},
				)
				.then((res) => res.data?.metaobjectDefinitionUpdate);
		}

		async function destroy(id: string) {
			return client
				.request<MetaobjectDefinitionDeleteMutation>(
					/* GraphQL */ `
						#graphql
						mutation MetaobjectDefinitionDelete($id: ID!) {
							metaobjectDefinitionDelete(id: $id) {
								deletedId
								userErrors {
									code
									field
									message
								}
							}
						}
					`,
					{variables: {id}},
				)
				.then((res) => res.data?.metaobjectDefinitionDelete);
		}
	}

	async function get(identifier: MetaobjectGetOne): ReturnType<typeof getOne>;
	async function get(identifier: MetaobjectGetAll): ReturnType<typeof getAll>;
	async function get(identifier: MetaobjectGetAll | MetaobjectGetOne) {
		return 'handle' in identifier ? getOne(identifier) : getAll(identifier);
	}

	async function set(
		handle: MetaobjectHandleInput,
		metaobject: Omit<MetaobjectUpsertInput, 'handle'> | null,
	) {
		if (metaobject === null) return destroy(handle);

		return client
			.request<MetaobjectUpsertMutation>(
				/* GraphQL */ `
					#graphql
					mutation MetaobjectUpsert(
						$handle: MetaobjectHandleInput!
						$metaobject: MetaobjectUpsertInput!
					) {
						metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
							metaobject {
								displayName
								fields {
									key
									type
									value
								}
								handle
								id
							}
							userErrors {
								code
								field
								message
							}
						}
					}
				`,
				{variables: {handle, metaobject}},
			)
			.then((res) => res.data?.metaobjectUpsert);
	}

	return {
		definition,
		get,
		set,
	};

	async function destroy(handle: MetaobjectHandleInput) {
		const metaobject = await get({handle});
		if (!metaobject) return;

		return client
			.request<MetaobjectDeleteMutation>(
				/* GraphQL */ `
					#graphql
					mutation MetaobjectDelete($id: ID!) {
						metaobjectDelete(id: $id) {
							deletedId
							userErrors {
								code
								field
								message
							}
						}
					}
				`,
				{variables: {id: metaobject.id}},
			)
			.then((res) => res.data?.metaobjectDelete);
	}

	async function getOne({handle}: MetaobjectGetOne) {
		return client
			.request<MetaobjectQuery>(
				/* GraphQL */ `
					#graphql
					query Metaobject($handle: MetaobjectHandleInput!) {
						metaobjectByHandle(handle: $handle) {
							id
						}
					}
				`,
				{variables: {handle}},
			)
			.then((res) => res.data?.metaobjectByHandle);
	}

	async function getAll(identifier: MetaobjectGetAll) {
		return client
			.request<MetaobjectsQuery>(
				/* GraphQL */ `
					#graphql
					query Metaobjects(
						$cursor: String
						$first: Int = 10
						$query: String
						$type: String!
					) {
						metaobjects(
							after: $cursor
							first: $first
							query: $query
							type: $type
						) {
							nodes {
								id
							}
						}
					}
				`,
				{variables: identifier},
			)
			.then((res) => res.data?.metaobjects.nodes);
	}
}

export interface MetaobjectGetAll {
	cursor?: string;
	first?: number;
	query?: string;
	type: string;
}

export interface MetaobjectGetOne {
	handle: MetaobjectHandleInput;
}

export function upload(client: Client) {
	async function stage(file: File) {
		const res = await client.request<StagedUploadsCreateMutation>(
			/* GraphQL */ `
				#graphql
				mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
					stagedUploadsCreate(input: $input) {
						stagedTargets {
							url
							resourceUrl
							parameters {
								name
								value
							}
						}
						userErrors {
							field
							message
						}
					}
				}
			`,
			{
				variables: {
					input: [
						{
							filename: file.name,
							httpMethod: 'POST',
							mimeType: file.type,
							resource: resource(file.type),
						},
					],
				},
			},
		);

		switch (true) {
			case res.errors === undefined && res.data === undefined:
			case res.errors !== undefined:
				throw new Exception(res.errors?.message ?? 'Failed to stage upload', {
					errors: res.errors?.graphQLErrors,
					status: res.errors?.networkStatusCode ?? 500,
					type: res.errors?.networkStatusCode ? 'RESPONSE' : 'SERVER',
				});

			case Boolean(res.data?.stagedUploadsCreate?.userErrors[0]):
			case !res.data?.stagedUploadsCreate?.stagedTargets?.[0]:
				throw new Exception(`Failed to stage upload`, {
					errors: res.data?.stagedUploadsCreate?.userErrors,
					status: 400,
					type: 'RESPONSE',
				});
		}

		const target = res.data.stagedUploadsCreate.stagedTargets[0];
		return target;
	}

	async function target(file: File) {
		const target = await stage(file);

		const body = new FormData();
		target.parameters.forEach(({name, value}) => body.set(name, value));
		body.set('file', file, file.name);

		const res = await fetch(target.url, {
			body,
			method: 'POST',
		});
		if (!res.ok) {
			throw new Exception(`Failed to upload data`, {
				status: 500,
				type: 'RESPONSE',
			});
		}

		return target;
	}

	async function process(file: File) {
		const targeted = await target(file);
		const created = await create(file, targeted);
		const processed = await wait(created.id);
		return processed;
	}

	return {
		process,
		stage,
		target,
	};

	async function create(file: File, target: StagedMediaUploadTarget) {
		const res = await client.request<FileCreateMutation>(
			/* GraphQL */ `
				#graphql
				mutation FileCreate($files: [FileCreateInput!]!) {
					fileCreate(files: $files) {
						files {
							fileErrors {
								code
								details
								message
							}
							id
						}
						userErrors {
							code
							field
							message
						}
					}
				}
			`,
			{
				variables: {
					files: [
						{
							contentType: resource(file.type),
							duplicateResolutionMode: 'REPLACE',
							filename: file.name,
							originalSource: target.resourceUrl,
						},
					],
				},
			},
		);

		switch (true) {
			case res.errors === undefined && res.data === undefined:
			case res.errors !== undefined:
				throw new Exception(res.errors?.message ?? 'Failed to create upload', {
					errors: res.errors?.graphQLErrors,
					status: res.errors?.networkStatusCode ?? 500,
					type: res.errors?.networkStatusCode ? 'RESPONSE' : 'SERVER',
				});

			case Boolean(res.data?.fileCreate?.userErrors[0]):
			case Boolean(res.data?.fileCreate?.files?.[0].fileErrors[0]):
			case !res.data?.fileCreate?.files?.[0]:
				throw new Exception(`Failed to create upload`, {
					errors:
						res.data?.fileCreate?.userErrors ??
						res.data?.fileCreate?.files?.[0].fileErrors,
					status: 400,
					type: 'RESPONSE',
				});
		}

		return res.data.fileCreate.files[0];
	}

	async function wait(id: string) {
		while (true) {
			const node = await client
				.request<FileQuery>(
					/* GraphQL */ `
						#graphql
						query File($id: ID!) {
							node(id: $id) {
								... on GenericFile {
									__typename
									fileErrors {
										code
										details
										message
									}
									fileStatus
									id
									url
								}
								... on MediaImage {
									__typename
									fileErrors {
										code
										details
										message
									}
									fileStatus
									id
									image {
										url
									}
								}
								... on Model3d {
									__typename
									fileErrors {
										code
										details
										message
									}
									fileStatus
									id
									originalSource {
										url
									}
								}
								... on Video {
									__typename
									fileErrors {
										code
										details
										message
									}
									fileStatus
									id
									originalSource {
										url
									}
								}
							}
						}
					`,
					{variables: {id}},
				)
				.then((res) => res.data?.node);
			if (!node) return;

			switch (node.fileStatus) {
				case 'FAILED':
					return;
				case 'READY': {
					let url: string | undefined;
					switch (node.__typename) {
						case 'GenericFile':
							url = node.url;
							break;
						case 'MediaImage':
							url = node.image?.url;
							break;
						case 'Model3d':
						case 'Video':
							url = node.originalSource?.url;
							break;
					}

					return {
						id: node.id,
						url,
					};
				}
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	function resource(type: File['type']) {
		switch (true) {
			case type.startsWith('image/'):
			case type.startsWith('application/x-photoshop'):
				return 'IMAGE';
			case type.startsWith('model/'):
				return 'MODEL_3D';
			case type.startsWith('video/'):
				return 'VIDEO';
			default:
				return 'FILE';
		}
	}
}

export async function proxy(context: Context, request: Request) {
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
				type: 'REQUEST',
			});
		}

		// shop is value due to hmac validation
		const shop = utils.sanitizeShop(url.searchParams.get('shop'));
		if (!shop) {
			throw new Exception('No shop param', {
				status: 400,
				type: 'REQUEST',
			});
		}

		const current = await session(context).get(shop);
		if (!current) {
			throw new Exception('No session found', {
				status: 401,
				type: 'REQUEST',
			});
		}
		return {
			client: client(current).admin(),
			session: current,
		};
	}

	const authenticated = await authenticate();
	return authenticated;
}

export async function redirect(
	context: Context,
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
					<script data-api-key="${SHOPIFY_API_KEY}" src="${APP_BRIDGE_URL}"></script>
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

export function session(context: Context, type: Sessiontype = 'admin') {
	const kv = context.cloudflare.env.SESSION_KV;

	function key(id: string) {
		return `${type}:${id}`;
	}

	async function get(id: string) {
		if (!id) return;
		return kv.get<Session>(key(id), 'json');
	}

	async function set(id: string, data: Session | null) {
		if (data === null) return kv.delete(key(id));
		if (!data) return;
		return kv.put(key(id), JSON.stringify(data));
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

export type Sessiontype = 'admin' | 'storefront';

type UtilEncoding = 'base64' | 'hex';

export const utils = {
	addCorsHeaders(context: Context, request: Request, responseHeaders: Headers) {
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

	gid(gid: string) {
		const parts = gid.split('/');
		return {
			id: parts.at(-1),
			ownerType: parts.at(-2),
		};
	},

	gidFrom(ownerType: string, id: string) {
		return `gid://shopify/${ownerType}/${id}`;
	},

	JSONL: {
		parse(jsonl: string) {
			return jsonl
				.split('\n')
				.filter((string) => string !== '')
				.map<JSONL>((string) => JSON.parse(string));
		},

		stringify(array: object[]): string {
			return array.map((object) => JSON.stringify(object)).join('\n');
		},
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
		context: Context,
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

export type JSON =
	| string
	| number
	| boolean
	| null
	| {[key: string]: JSON}
	| JSON[];

export type JSONL = Record<'__parentId' | 'id', string> &
	Record<string, JSON | JSON[]>;

export async function webhook(context: Context, request: Request) {
	async function authenticate() {
		const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
		if (!hmac) {
			throw new Exception('Webhook header is missing', {
				status: 400,
				type: 'REQUEST',
			});
		}

		const data = await request.clone().text();
		if (!data) {
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
				type: 'REQUEST',
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
