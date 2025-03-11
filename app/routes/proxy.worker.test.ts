import { env } from "node:process";
import type { AppLoadContext } from "react-router";
import { describe, expect, test } from "vitest";

import type { Route } from "./+types/proxy";
import { loader } from "./proxy";

const context = { cloudflare: { env } } as unknown as AppLoadContext;

describe("loader", () => {
	test("error on param missing", async () => {
		const url = new URL("http://localhost");
		const request = new Request(url);
		const response = await loader({ context, request } as Route.LoaderArgs);

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
		const response = await loader({ context, request } as Route.LoaderArgs);

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
		const response = await loader({ context, request } as Route.LoaderArgs);

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
		const response = await loader({ context, request } as Route.LoaderArgs);

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(false);
		expect(response?.status).toBe(401);
		expect(await response?.text()).toBe("Invalid hmac");
	});

	test("success", async () => {
		const searchParams = {
			timestamp: Math.trunc(Date.now() / 1_000).toString(),
		};
		const params = Object.entries(searchParams)
			.filter(([key]) => key !== "signature")
			.sort(([a], [b]) => a.localeCompare(b))
			.reduce((acc, [key, value]) => {
				return `${acc}${key}=${Array.isArray(value) ? value.join(",") : value}`;
			}, "");

		const encoder = new TextEncoder();
		const encodedKey = encoder.encode(
			context.cloudflare.env.SHOPIFY_API_SECRET_KEY,
		);
		const encodedData = encoder.encode(params);
		const hmacKey = await crypto.subtle.importKey(
			"raw",
			encodedKey,
			{
				name: "HMAC",
				hash: "SHA-256",
			},
			true,
			["sign"],
		);
		const signature = await crypto.subtle.sign("HMAC", hmacKey, encodedData);
		const hmac = [...new Uint8Array(signature)].reduce(
			(a, b) => a + b.toString(16).padStart(2, "0"),
			"",
		); // hex

		const url = new URL("http://localhost");
		Object.entries(searchParams).forEach(([key, value]) => {
			url.searchParams.set(key, value);
		});
		url.searchParams.set("signature", hmac);
		const request = new Request(url, { body: "{}", method: "POST" });
		const response = await loader({ context, request } as Route.LoaderArgs);

		expect(response).toBe(undefined);
	});
});
