import { env } from "cloudflare:workers";
import { SignJWT } from "jose";
import { describe, expect, test } from "vitest";

import { getHmacFromBody as getHmac } from "#app/utils.test";
import * as shopify from "./shopify.server";

const request = new Request("http://localhost");

test("admin", async () => {
	await expect(shopify.admin(request)).rejects.toBeDefined();
});

test("admin reuses the stored session", async () => {
	const shop = "test.myshopify.com";
	const session = { accessToken: "123", id: shop, scope: "read_products", shop };
	await shopify.session().set(shop, session);

	// a token exchange would be attempted against the shop domain, there is no session to exchange for
	const authenticated = await shopify.admin(
		new Request("http://localhost", {
			headers: { Authorization: `Bearer ${await sessionToken(shop)}` },
		}),
	);
	expect(authenticated.session).toStrictEqual(session);

	await shopify.session().set(shop, null);
});

async function sessionToken(shop: string) {
	return new SignJWT({ dest: `https://${shop}` })
		.setProtectedHeader({ alg: "HS256" })
		.setAudience(env.SHOPIFY_API_KEY)
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(new TextEncoder().encode(env.SHOPIFY_API_SECRET_KEY));
}

describe("billing", () => {
	test.todo("check");
});

describe("client", () => {
	const client = shopify.client({
		accessToken: "?",
		shop: "test.myshopify.com",
	});

	test("admin", () => {
		expect(client.admin()).toBeDefined();
	});

	test("storefront", () => {
		expect(client.storefront()).toBeDefined();
	});
});

test("config", () => {
	expect(shopify.config()).toBeDefined();
});

describe("createShopify", () => {
	test.todo("admin");
	test.todo("config");
	test.todo("proxy");
	test.todo("redirect");
	test.todo("session");
	test.todo("utils");
	test.todo("webhook");
});

describe("createShopifyClient", () => {
	test.todo("admin");
	test.todo("storefront");
});

test.todo("Exception");

test.todo("handler");

describe("metafield", () => {
	describe("definition", () => {
		test.todo("get");
		test.todo("set");
	});

	test.todo("get");
	test.todo("set");
});

describe("metaobject", () => {
	describe("definition", () => {
		test.todo("get");
		test.todo("set");
	});

	test.todo("get");
	test.todo("set");
});

test("proxy", async () => {
	await expect(shopify.proxy(request)).rejects.toBeDefined();
});

test("redirect", () => {
	const response = shopify.redirect(request, {
		shop: "test.myshopify.com",
		url: "/",
	});
	expect(response).toBeInstanceOf(Response);
	expect(response.status).toBe(302);
});

test("session", () => {
	expect(shopify.session().get).toBeDefined();
	expect(shopify.session().set).toBeDefined();
});

test("session get expired", async () => {
	const shop = "expired.myshopify.com";
	const session = { accessToken: "123", id: shop, scope: "read_products", shop };

	await shopify.session().set(shop, {
		...session,
		expires: new Date(Date.now() + 60_000).toJSON(),
	});
	expect(await shopify.session().get(shop)).toBeTruthy();

	await shopify.session().set(shop, {
		...session,
		expires: new Date(Date.now() - 60_000).toJSON(),
	});
	expect(await shopify.session().get(shop)).toBe(null);

	await shopify.session().set(shop, null);
});

describe("upload", () => {
	test.todo("stage");
	test.todo("target");
	test.todo("process");
});

describe("utils", () => {
	test("allowedDomains", () => {
		expect(shopify.utils.allowedDomains).toBe(
			"myshopify\\.com|myshopify\\.io|shop\\.dev|shopify\\.com",
		);
	});

	test("encode", () => {
		const encoder = new TextEncoder();
		const data = encoder.encode("test");

		expect(shopify.utils.encode(data.buffer, "base64")).toBe("dGVzdA==");
		expect(shopify.utils.encode(data.buffer, "hex")).toBe("74657374");
	});

	test("expired", () => {
		const session = { accessToken: "?", id: "?", scope: "?", shop: "?" };
		expect(shopify.utils.expired(session)).toBe(false);
		expect(shopify.utils.expired({ ...session, expires: "not-a-date" })).toBe(false);
		expect(
			shopify.utils.expired({ ...session, expires: new Date(Date.now() + 60_000).toJSON() }),
		).toBe(false);
		expect(
			shopify.utils.expired({ ...session, expires: new Date(Date.now() - 60_000).toJSON() }),
		).toBe(true);
	});

	test.todo("gid");
	test.todo("gidFrom");

	describe("JSONL", () => {
		test("nest", () => {
			const json = shopify.utils.JSONL.parse(
				[
					'{"id":"gid://shopify/Product/1","title":"one"}',
					'{"id":"gid://shopify/ProductVariant/9","__parentId":"gid://shopify/Product/1"}',
					'{"id":"gid://shopify/Product/2","title":"two"}',
				].join("\n"),
			);

			expect(shopify.utils.JSONL.nest(json)).toStrictEqual([
				{
					id: "gid://shopify/Product/1",
					title: "one",
					variants: [{ id: "gid://shopify/ProductVariant/9" }],
				},
				{ id: "gid://shopify/Product/2", title: "two" },
			]);
		});

		test("nest without children", () => {
			const json = shopify.utils.JSONL.parse('{"id":"gid://shopify/Product/1","title":"one"}');
			expect(shopify.utils.JSONL.nest(json)).toStrictEqual([
				{ id: "gid://shopify/Product/1", title: "one" },
			]);
		});

		test("nest orphaned child", () => {
			const json = shopify.utils.JSONL.parse(
				'{"id":"gid://shopify/ProductVariant/9","__parentId":"gid://shopify/Product/1"}',
			);
			expect(shopify.utils.JSONL.nest(json)).toStrictEqual([]);
		});

		test.todo("parse");
		test.todo("stringify");
	});

	test("legacyUrlToShopAdminUrl", () => {
		expect(shopify.utils.legacyUrlToShopAdminUrl("test.myshopify.com")).toBe(
			"admin.shopify.com/store/test",
		);
		expect(shopify.utils.legacyUrlToShopAdminUrl("test.example.com")).toBe(null);
	});

	test("sanitizeHost", () => {
		const host = btoa("test.myshopify.com");
		expect(shopify.utils.sanitizeHost(host)).toBe(host);
		expect(shopify.utils.sanitizeHost(btoa("test.example.com"))).toBe(null);
	});

	test("sanitizeHost on malformed input", () => {
		// base64 the regexp accepts but atob and the url parser do not
		expect(shopify.utils.sanitizeHost("a")).toBe(null);
		expect(shopify.utils.sanitizeHost(btoa(" "))).toBe(null);
		expect(shopify.utils.sanitizeHost(btoa("["))).toBe(null);
		expect(shopify.utils.sanitizeHost("!")).toBe(null);
	});

	test("sanitizeShop", () => {
		const shop = "test.myshopify.com";
		expect(shopify.utils.sanitizeShop("admin.shopify.com/store/test")).toBe(shop);
		expect(shopify.utils.sanitizeShop(shop)).toBe(shop);
		expect(shopify.utils.sanitizeShop(`${shop}/`)).toBe(shop);
		expect(shopify.utils.sanitizeShop("test.example.com")).toBe(null);
	});

	test("sanitizeShopFromDest", () => {
		const shop = "test.myshopify.com";
		expect(shopify.utils.sanitizeShopFromDest(`https://${shop}`)).toBe(shop);
		expect(shopify.utils.sanitizeShopFromDest(`https://${shop}/`)).toBe(shop);
		expect(shopify.utils.sanitizeShopFromDest(shop)).toBe(shop);
		expect(shopify.utils.sanitizeShopFromDest("https://test.example.com")).toBe(null);
	});

	test("validateHmac", async () => {
		const data = "123";
		const hmac = await getHmac(data);
		const encoding = "base64";

		expect.assertions(2);
		expect(await shopify.utils.validateHmac({ data, encoding, hmac })).toBe(true);
		expect(
			await shopify.utils.validateHmac({
				data: "124",
				encoding,
				hmac,
			}),
		).toBe(false);
	});
});

test("webhook", async () => {
	await expect(shopify.webhook(request)).rejects.toBeDefined();
});
