import {
	defineWorkersConfig,
	defineWorkersProject,
} from "@cloudflare/vitest-pool-workers/config";
import { defineConfig, defineWorkspace, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default defineWorkspace([
	defineConfig((config) =>
		mergeConfig(
			viteConfig(config),
			defineConfig({
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
			}),
		),
	),
	defineConfig((config) =>
		mergeConfig(
			viteConfig(config),
			defineConfig({
				test: {
					environment: "happy-dom",
					include: ["app/**/*.client.test.tsx"],
					name: "app/client",
				},
			}),
		),
	),
	defineConfig((config) =>
		mergeConfig(
			viteConfig(config),
			defineConfig({
				test: {
					environment: "node",
					include: ["app/**/*.server.test.ts"],
					name: "app/server",
				},
			}),
		),
	),
	defineWorkersConfig((config) =>
		mergeConfig(
			viteConfig(config),
			defineWorkersProject({
				test: {
					include: ["server.test.ts", "app/**/*.worker.test.ts"],
					name: "worker",
					poolOptions: {
						workers: {
							miniflare: {
								compatibilityFlags: ["service_binding_extra_handlers"],
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
