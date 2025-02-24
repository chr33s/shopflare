import { env } from "node:process"; // eslint-disable-line import-x/no-nodejs-modules
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
		expect(response.ok).toBe(false);
		expect(response.status).toBe(400);
		expect(await response.text()).toBe("Proxy param is missing");
	});

	test("error on encoded byte length mismatch", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set("signature", "123");
		const request = new Request(url, { method: "POST" });
		const response = await loader({ context, request } as Route.LoaderArgs);

		expect(response).toBeInstanceOf(Response);
		expect(response.ok).toBe(false);
		expect(response.status).toBe(401);
		expect(await response.text()).toBe("Encoded byte length mismatch");
	});

	test("error on invalid hmac", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set(
			"signature",
			"tKI9km9Efxo6gfUjbUBCo3XJ0CmqMLgb4xNzNhpQhK0=",
		); // NOTE: changed
		const request = new Request(url, { method: "POST" });
		const response = await loader({ context, request } as Route.LoaderArgs);

		expect(response).toBeInstanceOf(Response);
		expect(response.ok).toBe(false);
		expect(response.status).toBe(401);
		expect(await response.text()).toBe("Invalid hmac");
	});

	test("success", async () => {
		const url = new URL("http://localhost");
		url.searchParams.set(
			"signature",
			"V5q0lN+ETL76dDAHfNVvnaFkUeYdXV2C9gnza4Pdl0U=",
		);
		const request = new Request(url, { method: "POST" });
		const response = await loader({ context, request } as Route.LoaderArgs);

		expect(response).toBeInstanceOf(Response);
		expect(response.ok).toBe(true);
		expect(response.status).toBe(204);
		expect(response.body).toBe(null);
	});
});
