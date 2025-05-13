import { env } from "node:process";
import { defineConfig } from "@playwright/test";

const appUrl = env.HOST ?? env.SHOPIFY_APP_URL;

export default defineConfig({
	outputDir: "node_modules/.playwright",
	testDir: "./",
	testMatch: /.*\.e2e.test.ts/,
	use: {
		baseURL: appUrl,
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
		url: appUrl,
	},
});
