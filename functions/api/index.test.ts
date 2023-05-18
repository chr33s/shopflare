import { expect, test } from "vitest";

import { onRequestGet } from "./index";

const describe = setupMiniflareIsolatedStorage();
const env = getMiniflareBindings();

describe("functions/api", () => {
	test("/", async () => {
		const db = env.SHOPFLARE_KV;
		expect(db).toBeDefined();

		const { keys } = await db.list();
		expect(Array.isArray(keys)).toEqual(true);
	});

	test("/", async () => {
		const res = await onRequestGet({} as any);
		const json = await res.json();
		expect(json).toMatchObject({ status: "ok" });
	});
});
