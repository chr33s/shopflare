import {
	createExecutionContext,
	env,
	SELF,
	waitOnExecutionContext,
} from 'cloudflare:test';
import {afterEach, expect, test, vi} from 'vitest';

import server from './server';

afterEach(() => {
	vi.restoreAllMocks();
});

test('fetch', async () => {
	const response = await SELF.fetch('http://example.com');
	expect(await response.text()).toContain('<title>ShopFlare</title>');
	expect(response.status).toBe(200);
});

test.skip('worker', async () => {
	const request = new Request('http://example.com');
	const ctx = createExecutionContext();
	const response = await server.fetch(request as any, env, ctx);
	await waitOnExecutionContext(ctx);
	expect(await response.text()).toContain('<title>ShopFlare</title>');
	expect(response.status).toBe(200);
});
