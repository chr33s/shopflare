import { fileURLToPath } from "node:url";
import {
	defineWorkersConfig,
	defineWorkersProject,
} from "@cloudflare/vitest-pool-workers/config";
import { defineWorkspace, mergeConfig } from "vitest/config";

export default defineWorkspace([
	{
		extends: "./vitest.config.ts",
		test: {
			browser: {
				headless: true,
				enabled: true,
				instances: [{ browser: "webkit" }],
				provider: "playwright",
			},
			include: ["app/**/*.browser.test.tsx"],
			name: "browser",
		},
	},
	{
		extends: "./vitest.config.ts",
		test: {
			environment: "happy-dom",
			include: ["app/**/*.client.test.tsx"],
			name: "app/client",
		},
	},
	{
		extends: "./vitest.config.ts",
		test: {
			environment: "node",
			include: ["app/**/*.server.test.ts"],
			name: "app/server",
		},
	},
	defineWorkersConfig(
		mergeConfig(
			{ extends: "./vitest.config.ts" },
			defineWorkersProject({
				test: {
					alias: [
						{
							find: "virtual:react-router/server-build",
							replacement: fileURLToPath(
								new URL("./build/server/index.js", import.meta.url),
							),
						},
					],
					include: ["worker.test.ts", "app/**/*.worker.test.ts"],
					name: "workers",
					poolOptions: {
						workers: {
							main: "./build/server/index.js",
							miniflare: {
								compatibilityFlags: [
									"nodejs_compat",
									"service_binding_extra_handlers",
								],
								kvNamespaces: ["shopflare"],
								queueConsumers: ["shopflare"],
								queueProducers: { WEBHOOK_QUEUE: "shopflare" },
							},
							singleWorker: true,
							wrangler: { configPath: "./wrangler.json" },
						},
					},
				},
			}),
		),
	),
]);
