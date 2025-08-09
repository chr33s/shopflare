import assert from 'node:assert/strict';
import path from 'node:path';

import {cloudflare} from '@cloudflare/vite-plugin';
import type {Config} from '@react-router/dev/config';
import type {RouteConfigEntry} from '@react-router/dev/routes';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc/plugin';
import {
	createIdResolver,
	defineConfig,
	loadEnv,
	type Plugin,
	runnerImport,
} from 'vite';
import i18nextLoader from 'vite-plugin-i18next-loader';

import i18nextLoaderOptions from './i18n.config';

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, import.meta.dirname, '');
	const app = new URL(env.HOST || env.SHOPIFY_APP_URL);

	return {
		assetsInclude: ['**/*.gql'],
		base: app.href,
		clearScreen: false,
		define: define(env),
		environments: {
			client: {
				build: {outDir: 'build/client'},
				optimizeDeps: {
					include: [
						'react-router',
						'react-router/internal/react-server-client',
					],
				},
			},
			rsc: {
				build: {outDir: 'build/rsc'},
				optimizeDeps: {
					exclude: ['react-router'],
					include: [
						'react-router > cookie',
						'react-router > set-cookie-parser',
					],
				},
			},
			ssr: {
				build: {outDir: 'build/ssr'},
				optimizeDeps: {
					exclude: ['react-router'],
					include: [
						'react-router > cookie',
						'react-router > set-cookie-parser',
					],
				},
			},
		},
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			cloudflare({
				auxiliaryWorkers: [
					{
						configPath: './wrangler.rsc.json',
						viteEnvironment: {name: 'rsc'},
					},
				],
				configPath: './wrangler.json',
				viteEnvironment: {name: 'ssr'},
			}),
			react(),
			reactRouter(),
			rsc({
				entries: {client: 'app/entry.browser.tsx'},
				serverHandler: false,
			}),
		],
		server: {
			allowedHosts: [app.hostname],
			// pass cors handling to react-router
			cors: false,
			origin: app.origin,
			port: Number(env.PORT || 8080),
		},
	};
});

export function define(env: Record<string, string>) {
	return [
		'SHOPIFY_API_KEY',
		'SHOPIFY_APP_HANDLE',
		'SHOPIFY_APP_LOG_LEVEL',
		'SHOPIFY_APP_URL',
	].reduce(
		(a, k) => ({
			...a,
			[`import.meta.env.${k}`]: JSON.stringify(env[k]),
		}),
		{},
	);
}

export function reactRouter(): Plugin[] {
	let idResolver: ReturnType<typeof createIdResolver>;

	async function readReactRouterConfig(
		findFile: (id: string) => Promise<string | undefined>,
	) {
		// find react-router.config.ts
		const configFile = await findFile('./react-router.config');
		assert(configFile, "Cannot find 'react-router.config' file");
		const configImport = await runnerImport<{default: Config}>(configFile);
		const appDirectory = path.resolve(
			configImport.module.default.appDirectory ?? 'app',
		);

		// find routes.ts
		const routesFile = await findFile(path.join(appDirectory, 'routes'));
		assert(routesFile, "Cannot find 'routes' file");
		const routesImport = await runnerImport<{
			default: RouteConfigEntry[];
		}>(routesFile);

		// find root.tsx
		const rootFile = await findFile(path.join(appDirectory, 'root'));
		assert(rootFile, "Cannot find 'root' file");

		const routes = [
			{
				children: routesImport.module.default,
				file: rootFile,
				id: 'root',
				path: '',
			},
		];

		return {appDirectory, configFile, routes, routesFile};
	}

	function generateRoutesCode(config: {
		appDirectory: string;
		routes: RouteConfigEntry[];
	}) {
		let code = 'export default [';
		const closeRouteSymbol = Symbol('CLOSE_ROUTE');
		const stack: (typeof closeRouteSymbol | RouteConfigEntry)[] = [
			...config.routes,
		];
		while (stack.length > 0) {
			const route = stack.pop();
			if (!route) break;
			if (route === closeRouteSymbol) {
				code += ']},';
				continue;
			}
			code += '{';
			// eslint-disable-next-line no-warning-comments
			// TODO: route-module transform
			code += `lazy: () => import(${JSON.stringify(
				path.resolve(config.appDirectory, route.file),
			)}),`;
			code += `id: ${JSON.stringify(
				route.id || createRouteId(route.file, config.appDirectory),
			)},`;
			if (typeof route.path === 'string') {
				code += `path: ${JSON.stringify(route.path)},`;
			}
			if (route.index) {
				code += `index: true,`;
			}
			if (route.caseSensitive) {
				code += `caseSensitive: true,`;
			}
			if (route.children) {
				code += 'children:[';
				stack.push(closeRouteSymbol);
				stack.push(...[...route.children].reverse());
			} else {
				code += '},';
			}
		}
		code += '];\n';

		return code;
	}

	function createRouteId(file: string, appDirectory: string) {
		return path
			.relative(appDirectory, file)
			.replace(/\\+/, '/')
			.slice(0, -path.extname(file).length);
	}

	return [
		{
			config: () => ({
				build: {
					rollupOptions: {
						external: ['virtual:react-router-routes'],
					},
				},
			}),
			configResolved(config) {
				idResolver = createIdResolver(config);
			},
			async load(id) {
				if (id === '\0virtual:react-router-routes') {
					const findFile = (id: string) => idResolver(this.environment, id);
					const config = await readReactRouterConfig(findFile);
					this.addWatchFile(config.configFile);
					this.addWatchFile(config.routesFile);
					const code = generateRoutesCode(config);
					return code;
				}
			},
			name: 'react-router:config',
			resolveId(source) {
				if (source === 'virtual:react-router-routes') {
					return `\0${source}`;
				}
			},
		},
	];
}
