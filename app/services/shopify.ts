import {RpcTarget, WorkerEntrypoint} from 'cloudflare:workers';

import * as shopify from '~/shopify.server';

interface Params {
	shop: string;
}

class ShopifyApi extends RpcTarget {
	#context: shopify.Context;
	#session: ReturnType<typeof shopify.session>;
	#shop: string;

	constructor(context: shopify.Context, {shop}: Params) {
		super();

		this.#context = context;
		this.#session = shopify.session(this.#context);
		this.#shop = shop;
	}

	async bulkOperation() {}

	async client() {
		const session = await this.#session.get(this.#shop);
		if (!session) {
			throw new shopify.Exception(`Session not found: ${this.#shop}`, {
				status: 401,
				type: 'SESSION',
			});
		}

		return shopify.client({
			accessToken: session.accessToken,
			shop: this.#shop,
		});
	}

	async query(params: {query: string; variables?: Record<string, any>}) {
		const {admin: client} = await this.client();
		return client().request<any>(params.query, {variables: params.variables});
	}

	async upload() {}
}

export class ShopifyService extends WorkerEntrypoint<Env> {
	#context: shopify.Context = {
		cloudflare: {
			ctx: this.ctx,
			env: this.env,
		},
	};

	async api({shop}: {shop: string}) {
		return new ShopifyApi(this.#context, {shop});
	}

	async oauth() {}
}
