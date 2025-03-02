import {
	env,
	createExecutionContext,
	SELF,
	waitOnExecutionContext,
	// eslint-disable-next-line import-x/no-unresolved
} from "cloudflare:test";
import { afterEach, expect, test, vi } from "vitest";

import worker from "./server";

afterEach(() => {
	vi.restoreAllMocks();
});

test("fetch", async () => {
	const response = await SELF.fetch("http://example.com");
	expect(await response.text()).toContain("<title>ShopFlare</title>");
	expect(response.status).toBe(200);
});

test("worker", async () => {
	const request = new Request("http://example.com");
	const ctx = createExecutionContext();
	const response = await worker.fetch(request as any, env as any, ctx); // eslint-disable-line @typescript-eslint/no-explicit-any
	await waitOnExecutionContext(ctx);
	expect(await response.text()).toContain("<title>ShopFlare</title>");
	expect(response.status).toBe(200);
});
