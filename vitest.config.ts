import { fileURLToPath } from "node:url";
import { defineWorkersProject } from "@cloudflare/vitest-pool-workers/config";
import { loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import { defineConfig, mergeConfig } from "vitest/config";

import i18nextLoaderOptions from "./i18n.config";
import { define } from "./vite.config";

export default defineConfig((config) => {
  const env = loadEnv(config.mode, import.meta.dirname, "");

  return {
    define: define(env),
    plugins: [i18nextLoader(i18nextLoaderOptions)],
    test: {
      css: true,
      globalSetup: ["./vitest.global-setup.ts"],
      projects: [
        {
          extends: "./vitest.config.ts",
          plugins: [cloudflareWorkersPlugin()],
          test: {
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: "webkit" }],
              provider: "playwright",
            },
            include: ["app/**/*.client.test.tsx"],
            name: "client",
          },
        },
        mergeConfig(
          { extends: "./vitest.config.ts" },
          defineWorkersProject({
            test: {
              alias: [
                {
                  find: "virtual:react-router/server-build",
                  replacement: fileURLToPath(new URL("./build/server/index.js", import.meta.url)),
                },
              ],
              include: ["app/entry.worker.test.ts", "app/**/*server.test.ts"],
              name: "server",
              poolOptions: {
                workers: {
                  miniflare: {
                    compatibilityFlags: [
                      "enable_nodejs_http_modules",
                      "enable_nodejs_fs_module",
                      "enable_nodejs_perf_hooks_module",
                      "enable_nodejs_tty_module",
                      "nodejs_compat",
                    ],
                  },
                  isolatedStorage: true,
                  main: "./build/server/index.js",
                  singleWorker: true,
                  wrangler: { configPath: "./wrangler.json" },
                },
              },
            },
          }),
        ),
      ],
      watch: false,
    },
  };
});

function cloudflareWorkersPlugin() {
  const virtualModuleId = "cloudflare:workers";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `
					export const env = import.meta.env;
					export const waitUntil = Promise.resolve;
				`;
      }
    },
    name: virtualModuleId,
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
  };
}
