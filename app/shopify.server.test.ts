import { env } from "node:process";
import type { AppLoadContext } from "react-router";
import { expect, test } from "vitest";

import { createShopify } from "./shopify.server";

const context = { cloudflare: { env } } as unknown as AppLoadContext;

test("createShopify", () => {
	const shopify = createShopify(context);
	expect(shopify.admin).toBeDefined();
});
