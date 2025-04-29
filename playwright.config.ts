import { env } from "node:process";
import { defineConfig } from "@playwright/test";

export default defineConfig({
	outputDir: "node_modules/.playwright",
	testDir: "./",
	testMatch: /.*\.e2e.test.ts/,
	use: {
		baseURL: env.SHOPIFY_APP_URL,
		extraHTTPHeaders: {
			Accept: "application/json",
			// Authorization: `token ${env.SHOPIFY_STOREFRONT_ACCESS_TOKEN}`,
		},
		locale: "en",
		serviceWorkers: "allow",
	},
	webServer: {
		command: "npm run dev",
		reuseExistingServer: true,
		timeout: 10 * 1000,
		url: env.SHOPIFY_APP_URL,
	},
});
