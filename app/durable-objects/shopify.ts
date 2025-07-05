import type {RequestOptions} from '@shopify/graphql-client';
import {DurableObject} from 'cloudflare:workers';
import {type JWTPayload, jwtVerify} from 'jose';

import * as shopify from '~/shopify.server';

type ClientType = shopify.Sessiontype;

export class ShopifyDurableObject extends DurableObject<Env> {
	#shop: string;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		if (!ctx.id.name) throw new Error('No shop from ctx.id.name');
		this.#shop = ctx.id.name;
	}

	async bulkOperation() {
		const client = await this.client('admin');
		return shopify.bulkOperation(client);
	}

	async client(type: ClientType) {
		const session = await this.session(type);
		if (!session) throw new Error(`No session for shop ${this.#shop}`);
		return shopify.client({
			accessToken: session.accessToken,
			shop: this.#shop,
		})[type];
	}

	async metafield() {
		const client = await this.client('admin');
		return shopify.metafield(client);
	}

	async metaobject() {
		const client = await this.client('admin');
		return shopify.metaobject(client);
	}

	async upload(file: File) {
		const client = await this.client('admin');
		return shopify.upload(client).process(file);
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
					type: 'JWT',
				});
			}

			if (request.method !== 'POST') {
				throw new shopify.Exception('Method Not Allowed', {
					status: 405,
					type: 'HTTP',
				});
			}

			const pattern = new URLPattern({
				pathname: '/shopify/:client{/:protocol}?',
			});
			const params = pattern.exec(request.url)?.pathname.groups;
			if (!params) {
				throw new shopify.Exception('Client Not Found', {
					status: 404,
					type: 'HTTP',
				});
			}

			const {operation, variables} = await request.json<{
				operation: string;
				variables?: RequestOptions['variables'];
			}>();
			if (!operation) {
				throw new shopify.Exception('Missing body operation', {
					status: 400,
					type: 'HTTP',
				});
			}

			const client = await this.client(params.client as ClientType);
			return client().fetch(operation, {
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

	private async session(type: ClientType) {
		const context = {cloudflare: {env: this.env}} as shopify.Context;
		return shopify.session(context, type).get(this.#shop);
	}
}
