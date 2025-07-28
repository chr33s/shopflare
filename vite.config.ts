import {cloudflare} from '@cloudflare/vite-plugin';
import {reactRouter} from '@react-router/dev/vite';
import {defineConfig, loadEnv} from 'vite';
import babel from 'vite-plugin-babel';
import i18nextLoader from 'vite-plugin-i18next-loader';

import i18nextLoaderOptions from './i18n.config';

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, import.meta.dirname, '');
	const app = new URL(env.HOST ?? env.SHOPIFY_APP_URL);

	return {
		assetsInclude: ['**/*.gql'],
		base: app.href,
		clearScreen: false,
		define: define(env),
		plugins: [
			i18nextLoader(i18nextLoaderOptions),
			cloudflare({viteEnvironment: {name: 'ssr'}}),
			reactRouter(),
			babel({
				babelConfig: {
					plugins: [['babel-plugin-react-compiler']],
					presets: ['@babel/preset-typescript'],
				},
				filter: /\.[jt]sx?$/,
			}),
		],
		resolve: {
			mainFields: ['browser', 'module', 'main'],
		},
		server: {
			allowedHosts: [app.hostname],
			// pass cors handling to react-router
			cors: false,
			origin: app.origin,
			port: Number(env.PORT || 8080),
		},
		ssr: {
			resolve: {
				conditions: ['workerd', 'worker', 'browser'],
			},
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
