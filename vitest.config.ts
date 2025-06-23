import {fileURLToPath} from 'node:url';

import {
	defineWorkersConfig,
	defineWorkersProject,
} from '@cloudflare/vitest-pool-workers/config';
import {loadEnv} from 'vite';
import i18nextLoader from 'vite-plugin-i18next-loader';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, mergeConfig} from 'vitest/config';

import i18nextLoaderOptions from './i18n.config';
import {define} from './vite.config';

export default defineConfig((config) => {
	const env = loadEnv(config.mode, import.meta.dirname, '');

	return {
		define: define(env),
		optimizeDeps: {
			include: ['react/jsx-dev-runtime'],
		},
		plugins: [i18nextLoader(i18nextLoaderOptions), tsconfigPaths()],
		test: {
			css: true,
			projects: [
				{
					extends: './vitest.config.ts',
					test: {
						browser: {
							headless: true,
							enabled: true,
							instances: [{browser: 'webkit'}],
							provider: 'playwright',
						},
						include: ['app/**/*.browser.test.tsx'],
						name: 'browser',
					},
				},
				{
					extends: './vitest.config.ts',
					test: {
						environment: 'happy-dom',
						include: ['app/**/*.client.test.tsx'],
						name: 'client',
					},
				},
				defineWorkersConfig(
					mergeConfig(
						{extends: './vitest.config.ts'},
						defineWorkersProject({
							test: {
								alias: [
									{
										find: 'virtual:react-router/server-build',
										replacement: fileURLToPath(
											new URL('./build/server/index.js', import.meta.url),
										),
									},
								],
								include: ['app/server.test.ts', 'app/**/*.server.test.ts'],
								name: 'server',
								poolOptions: {
									workers: {
										isolatedStorage: false,
										main: './build/server/index.js',
										miniflare: {
											compatibilityFlags: [
												'nodejs_compat',
												'service_binding_extra_handlers',
											],
										},
										singleWorker: true,
										wrangler: {configPath: './wrangler.json'},
									},
								},
							},
						}),
					),
				),
			],
			watch: false,
		},
	};
});
