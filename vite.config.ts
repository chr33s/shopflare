import {cloudflare} from '@cloudflare/vite-plugin';
import {reactRouter} from '@react-router/dev/vite';
import {defineConfig, loadEnv} from 'vite';
import i18nextLoader from 'vite-plugin-i18next-loader';

import i18nextLoaderOptions from './i18n.config';

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, import.meta.dirname, '');
	const app = new URL(env.HOST || env.SHOPIFY_APP_URL);

	return {
		assetsInclude: ['**/*.gql'],
		base: app.href,
		build: {
			assetsInlineLimit: 0,
		},
		clearScreen: false,
		define: define(env),
		optimizeDeps: {
			include: ['@shopify/app-bridge-react'],
		},
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			cloudflare({viteEnvironment: {name: 'ssr'}}),
			reactRouter(),
		],
		server: {
			allowedHosts: [app.hostname],
			// pass cors handling to react-router
			cors: false,
			fs: {
				// See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
				allow: ['app', 'node_modules'],
			},
			origin: app.origin,
			port: Number(env.PORT || 8080),
			preflightContinue: true,
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
