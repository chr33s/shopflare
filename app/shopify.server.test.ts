import {env} from 'cloudflare:test';
import type {AppLoadContext} from 'react-router';
import {describe, expect, test} from 'vitest';

import * as shopify from './shopify.server';

const context = {cloudflare: {env}} as unknown as AppLoadContext;
const request = new Request('http://localhost');

test('admin', () => {
	expect(shopify.admin(context, request)).toBeDefined();
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

test('log', () => {
	expect(shopify.log('error')).toBeDefined();
});

test('proxy', () => {
	expect(shopify.proxy(context, request)).toBeDefined();
});

test('redirect', () => {
	expect(
		shopify.redirect(context, request, {
			url: '/',
			shop: 'test.myshopify.com',
		}),
	).toBeDefined();
});

test('session', () => {
	expect(shopify.session(context).get).toBeDefined();
	expect(shopify.session(context).set).toBeDefined();
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
		const hmac = 'n4AEkjln23lncb9LphO+UPXo6yy8OqROUdN+Acw9yhE=';
		const encoding = 'base64';

		expect.assertions(2);
		expect(
			await shopify.utils.validateHmac(context, {data, hmac, encoding}),
		).toBe(true);
		expect(
			await shopify.utils.validateHmac(context, {
				data: '124',
				hmac,
				encoding,
			}),
		).toBe(false);
	});
});

test('webhook', () => {
	expect(shopify.webhook(context, request)).toBeDefined();
});
