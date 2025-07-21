import {env} from 'cloudflare:test';
import {describe, expect, test} from 'vitest';

import {getHmacFromSearchParams as getHmac} from '#app/utils.test';

import * as shopify from '../shopify.server';

import type {Route} from './+types/proxy.index';
import {loader} from './proxy.index';

const context = {
	cloudflare: {env: {...env, SHOPIFY_APP_LOG_LEVEL: 'error'}},
} as unknown as shopify.Context;

describe('loader', () => {
	test('error on param missing', async () => {
		const url = new URL('http://localhost');
		const request = new Request(url);
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(400);
		expect(await response?.text()).toBe('Proxy signature param is missing');
	});

	test('error on proxy timestamp is expired', async () => {
		const url = new URL('http://localhost');
		url.searchParams.set('signature', '123');
		url.searchParams.set('timestamp', `${Math.trunc(Date.now() / 1_000 - 91)}`);
		const request = new Request(url, {method: 'POST'});
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(400);
		expect(await response?.text()).toBe('Proxy timestamp param is expired');
	});

	test('error on encoded byte length mismatch', async () => {
		const url = new URL('http://localhost');
		url.searchParams.set('signature', '123');
		url.searchParams.set('timestamp', `${Math.trunc(Date.now() / 1_000)}`);
		const request = new Request(url, {method: 'POST'});
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe('Invalid hmac');
	});

	test('error on invalid hmac', async () => {
		const url = new URL('http://localhost');
		// NOTE: changed
		url.searchParams.set(
			'signature',
			'548e324a5420c20bffa1d81318b5790de43731c278d0435108e5bcdbdc20795d',
		);
		url.searchParams.set('timestamp', `${Math.trunc(Date.now() / 1_000)}`);
		const request = new Request(url, {method: 'POST'});
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe('Invalid hmac');
	});

	test('error on no session access token', async () => {
		const timestamp = Math.trunc(Date.now() / 1_000).toString();
		const shop = 'test.myshopify.com';

		const url = new URL('http://localhost');
		url.searchParams.set('signature', await getHmac({shop, timestamp}));
		url.searchParams.set('timestamp', timestamp);
		url.searchParams.set('shop', shop);

		const request = new Request(url, {method: 'POST'});
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe('No session found');
	});

	test('success', async () => {
		const shop = 'test.myshopify.com';

		const session = shopify.session(context);
		await session.set(shop, {
			accessToken: '123',
			id: shop,
			scope: 'read_products',
			shop,
		});

		const timestamp = Math.trunc(Date.now() / 1_000).toString();

		const url = new URL('http://localhost');
		url.searchParams.set('signature', await getHmac({shop, timestamp}));
		url.searchParams.set('timestamp', timestamp);
		url.searchParams.set('shop', shop);

		const request = new Request(url, {body: '{}', method: 'POST'});
		const response = await catchLoaderResponse({
			context,
			request,
		});

		expect(response).toStrictEqual({data: {}});

		await session.set(shop, null);
	});
});

function catchLoaderResponse(args: any) {
	return Promise.resolve(loader(args as Route.LoaderArgs)).catch(
		(err) => err,
	) as Promise<Response>;
}
