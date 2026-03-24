import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { env, exports } from "cloudflare:workers";
import { afterEach, expect, test, vi } from "vitest";

import server from "./server";

afterEach(() => {
	vi.restoreAllMocks();
});

test.skip("fetch", async () => {
	const response = await exports.default.fetch("http://example.com");
	expect(await response.text()).toContain("<title>ShopFlare</title>");
	expect(response.status).toBe(200);
});

test("worker", async () => {
	const request = new Request("http://example.com");
	const ctx = createExecutionContext();
	const response = await server.fetch(request as any, env, ctx);
	await waitOnExecutionContext(ctx);
	expect(await response.text()).toContain("<title>ShopFlare</title>");
	expect(response.status).toBe(200);
});
