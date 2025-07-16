import type {RequestOptions} from '@shopify/graphql-client';
import {DurableObject} from 'cloudflare:workers';
import {type JWTPayload, jwtVerify} from 'jose';

import * as shopify from '~/shopify.server';

type ClientType = shopify.Sessiontype;

export class ShopifyDurableObject extends DurableObject<Env> {
	#client: shopify.Client;
	#shop: string;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		const shop = ctx.id.name;
		if (!shop) {
			throw new shopify.Exception('No shop from ctx.id.name', {
				status: 400,
				type: 'REQUEST',
			});
		}
		this.#shop = shop;

		ctx.blockConcurrencyWhile(async () => {
			this.#client = await this.client('admin');
		});
	}

	async bulkOperation() {
		return shopify.bulkOperation(this.#client);
	}

	async client(type: ClientType, headers?: Record<string, string | string[]>) {
		const session = await this.#session(type);
		const props = {
			accessToken: session.accessToken,
			shop: this.#shop,
		};
		return shopify.client(props)[type](headers);
	}

	async fetch(request: Request) {
		try {
			const url = new URL(request.url);

			const encodedSessionToken =
				request.headers.get('Authorization')?.replace('Bearer ', '') ||
				url.searchParams.get('id_token') ||
				'';
			const {payload} = await jwtVerify<JWTPayload & {dest: string}>(
				encodedSessionToken,
				new TextEncoder().encode(this.env.SHOPIFY_API_SECRET_KEY),
				{
					algorithms: ['HS256'],
					clockTolerance: 10,
				},
			);

			// The exp and nbf fields are validated by the JWT library
			if (payload.aud !== this.env.SHOPIFY_API_KEY) {
				throw new shopify.Exception('Session token had invalid API key', {
					status: 401,
					type: 'REQUEST',
				});
			}

			if (request.method !== 'POST') {
				throw new shopify.Exception('Method Not Allowed', {
					status: 405,
					type: 'REQUEST',
				});
			}

			const pattern = new URLPattern({
				pathname: '/shopify/:client{/:protocol}?',
			});
			const params = pattern.exec(request.url)?.pathname.groups;
			if (!params) {
				throw new shopify.Exception('Client Not Found', {
					status: 404,
					type: 'REQUEST',
				});
			}

			const {operation, variables} = await request.json<{
				operation: string;
				variables?: RequestOptions['variables'];
			}>();
			if (!operation) {
				throw new shopify.Exception('Missing body operation', {
					status: 400,
					type: 'REQUEST',
				});
			}

			const client = await this.client(params.client as ClientType);
			return client.fetch(operation, {
				headers: Object.fromEntries(request.headers),
				keepalive: false,
				signal: request.signal,
				variables,
			});
		} catch (error: any) {
			return new Response(error.message ?? 'Unknown Error', {
				status: error.cause ?? 500,
			});
		}
	}

	async metafield() {
		return shopify.metafield(this.#client);
	}

	async metaobject() {
		return shopify.metaobject(this.#client);
	}

	async uninstall() {
		return fetch(`https://${this.#shop}/admin/api_permissions/current.json`, {
			headers: new Headers({
				Accept: 'application/json',
				'Content-Length': '0',
				'Content-Type': 'application/json',
				'X-Shopify-Access-Token': this.env.SHOPIFY_API_SECRET_KEY,
			}),
			method: 'DELETE',
		}).then((res) => res.ok);
	}

	async upload() {
		return shopify.upload(this.#client);
	}

	async #session(type: ClientType) {
		const context = {cloudflare: {env: this.env}} as shopify.Context;
		const session = await shopify.session(context, type).get(this.#shop);
		if (!session) {
			throw new shopify.Exception(`No ${type} session for shop ${this.#shop}`, {
				status: 401,
				type: 'REQUEST',
			});
		}
		return session;
	}
}
