import { SELF } from "cloudflare:test"; // eslint-disable-line import-x/no-unresolved
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
	vi.restoreAllMocks();
});

test("fetch", async () => {
	const response = await SELF.fetch("http://example.com");
	expect(await response.text()).toContain("<title>ShopFlare</title>");
	expect(response.status).toBe(200);
});
