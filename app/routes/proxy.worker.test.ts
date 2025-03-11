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

	test.skip("success", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set(
			"signature",
			"548e324a5420c20bffa1d81318b5790de43731c278d0435108e5bcdbdc20795c",
		);
		url.searchParams.set("timestamp", `${Math.trunc(Date.now() / 1_000)}`);
		const request = new Request(url, { method: "POST" });
		const response = await loader({ context, request } as Route.LoaderArgs);

		console.log(await response.text());

		expect(response).toBeInstanceOf(Response);
		expect(response?.ok).toBe(true);
		expect(response?.status).toBe(204);
		expect(response?.body).toBe(null);
	});
});
