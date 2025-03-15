import { env } from "cloudflare:test";
import type { AppLoadContext } from "react-router";
import { describe, expect, test } from "vitest";

import { ShopifySession } from "../shopify.server";
import type { Route } from "./+types/proxy";
import { loader } from "./proxy";

const context = {
	cloudflare: { env: { ...env, SHOPIFY_APP_LOG_LEVEL: "error" } },
} as unknown as AppLoadContext;

describe("loader", () => {
	test("error on param missing", async () => {
		const url = new URL("http://localhost");
		const request = new Request(url);
		const response = (await loader({
			context,
			request,
		} as Route.LoaderArgs)) as Response;

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(400);
		expect(await response?.text()).toBe("Proxy param is missing");
	});

	test("error on proxy timestamp is expired", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set("signature", "123");
		url.searchParams.set("timestamp", `${Math.trunc(Date.now() / 1_000 - 91)}`);
		const request = new Request(url, { method: "POST" });
		const response = (await loader({
			context,
			request,
		} as Route.LoaderArgs)) as Response;

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(400);
		expect(await response?.text()).toBe("Proxy timestamp is expired");
	});

	test("error on encoded byte length mismatch", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set("signature", "123");
		url.searchParams.set("timestamp", `${Math.trunc(Date.now() / 1_000)}`);
		const request = new Request(url, { method: "POST" });
		const response = (await loader({
			context,
			request,
		} as Route.LoaderArgs)) as Response;

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe("Encoded byte length mismatch");
	});

	test("error on invalid hmac", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set(
			"signature",
			"548e324a5420c20bffa1d81318b5790de43731c278d0435108e5bcdbdc20795d",
		); // NOTE: changed
		url.searchParams.set("timestamp", `${Math.trunc(Date.now() / 1_000)}`);
		const request = new Request(url, { method: "POST" });
		const response = (await loader({
			context,
			request,
		} as Route.LoaderArgs)) as Response;

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe("Invalid hmac");
	});

	test("error on no session access token", async () => {
		const timestamp = Math.trunc(Date.now() / 1_000).toString();

		const url = new URL("http://localhost");
		url.searchParams.set("signature", await getHmac({ timestamp }));
		url.searchParams.set("timestamp", timestamp);

		const request = new Request(url, { method: "POST" });
		const response = (await loader({
			context,
			request,
		} as Route.LoaderArgs)) as Response;

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe("No session access token");
	});

	test("success", async () => {
		const shop = "test.myshopify.com";

		const session = new ShopifySession(context.cloudflare.env.SESSION_STORAGE);
		await session.set({
			accessToken: "123",
			id: shop,
			scope: "read_products",
			shop,
		});

		const timestamp = Math.trunc(Date.now() / 1_000).toString();

		const url = new URL("http://localhost");
		url.searchParams.set("signature", await getHmac({ shop, timestamp }));
		url.searchParams.set("timestamp", timestamp);
		url.searchParams.set("shop", shop);

		const request = new Request(url, { body: "{}", method: "POST" });
		const response = await loader({
			context,
			request,
		} as Route.LoaderArgs);

		expect(response).toStrictEqual({
			appUrl: context.cloudflare.env.SHOPIFY_APP_URL,
		});

		await session.delete(shop);
	});
});

async function getHmac(searchParams: object) {
	const params = Object.entries(searchParams)
		.filter(([key]) => key !== "signature")
		.map(
			([key, value]) =>
				`${key}=${Array.isArray(value) ? value.join(",") : value}`,
		)
		.sort((a, b) => a.localeCompare(b))
		.join("");

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(context.cloudflare.env.SHOPIFY_API_SECRET_KEY),
		{
			name: "HMAC",
			hash: "SHA-256",
		},
		true,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(params),
	);
	const hmac = [...new Uint8Array(signature)].reduce(
		(a, b) => a + b.toString(16).padStart(2, "0"),
		"",
	); // hex
	return hmac;
}
