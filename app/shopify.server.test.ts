import {env} from 'cloudflare:test';
import {describe, expect, test} from 'vitest';

import {getHmacFromBody as getHmac} from '#app/utils.test';
import * as shopify from './shopify.server';

const context = {cloudflare: {env}} as unknown as shopify.Context;
const request = new Request('http://localhost');

test('admin', () => {
	expect(shopify.admin(context, request)).toBeDefined();
});

describe('billing', () => {
	test.todo('check');
});

describe('client', () => {
	const client = shopify.client({
		accessToken: '?',
		shop: 'test.myshopify.com',
	});

	test('admin', () => {
		expect(client.admin()).toBeDefined();
	});

	test('storefront', () => {
		expect(client.storefront()).toBeDefined();
	});
});

test('config', () => {
	expect(shopify.config(context)).toBeDefined();
});

describe('createShopify', () => {
	test.todo('admin');
	test.todo('config');
	test.todo('proxy');
	test.todo('redirect');
	test.todo('session');
	test.todo('utils');
	test.todo('webhook');
});

describe('createShopifyClient', () => {
	test.todo('admin');
	test.todo('storefront');
});

test.todo('Exception');

test.todo('handler');

describe('metafield', () => {
	describe('definition', () => {
		test.todo('get');
		test.todo('set');
	});

	test.todo('get');
	test.todo('set');
});

describe('metaobject', () => {
	describe('definition', () => {
		test.todo('get');
		test.todo('set');
	});

	test.todo('get');
	test.todo('set');
});

test('proxy', () => {
	expect(shopify.proxy(context, request)).toBeDefined();
});

test('redirect', () => {
	expect(
		shopify.redirect(context, request, {
			shop: 'test.myshopify.com',
			url: '/',
		}),
	).toBeDefined();
});

test('session', () => {
	expect(shopify.session(context).get).toBeDefined();
	expect(shopify.session(context).set).toBeDefined();
});

describe('upload', () => {
	test.todo('stage');
	test.todo('target');
	test.todo('process');
});

describe('utils', () => {
	test('allowedDomains', () => {
		expect(shopify.utils.allowedDomains).toBe(
			'myshopify\\.com|myshopify\\.io|shop\\.dev|shopify\\.com',
		);
	});

	test('encode', async () => {
		const encoder = new TextEncoder();
		const data = encoder.encode('test');

		expect(shopify.utils.encode(data, 'base64')).toBe('dGVzdA==');
		expect(shopify.utils.encode(data, 'hex')).toBe('74657374');
	});

	test.todo('gid');
	test.todo('gidFrom');

	describe('JSONL', () => {
		test.todo('parse');
		test.todo('stringify');
	});

	test('legacyUrlToShopAdminUrl', () => {
		expect(shopify.utils.legacyUrlToShopAdminUrl('test.myshopify.com')).toBe(
			'admin.shopify.com/store/test',
		);
		expect(shopify.utils.legacyUrlToShopAdminUrl('test.example.com')).toBe(
			null,
		);
	});

	test('sanitizeHost', () => {
		const host = btoa('test.myshopify.com');
		expect(shopify.utils.sanitizeHost(host)).toBe(host);
		expect(shopify.utils.sanitizeHost(btoa('test.example.com'))).toBe(null);
	});

	test('sanitizeShop', () => {
		const shop = 'test.myshopify.com';
		expect(shopify.utils.sanitizeShop('admin.shopify.com/store/test')).toBe(
			shop,
		);
		expect(shopify.utils.sanitizeShop(shop)).toBe(shop);
		expect(shopify.utils.sanitizeShop('test.example.com')).toBe(null);
	});

	test('validateHmac', async () => {
		const data = '123';
		const hmac = await getHmac(data);
		const encoding = 'base64';

		expect.assertions(2);
		expect(
			await shopify.utils.validateHmac(context, {data, encoding, hmac}),
		).toBe(true);
		expect(
			await shopify.utils.validateHmac(context, {
				data: '124',
				encoding,
				hmac,
			}),
		).toBe(false);
	});
});

test('webhook', () => {
	expect(shopify.webhook(context, request)).toBeDefined();
});
