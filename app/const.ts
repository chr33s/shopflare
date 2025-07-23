export const API_KEY = import.meta.env?.SHOPIFY_API_KEY;
export const API_VERSION = '2025-07';
const SHOPIFY_CDN = 'https://cdn.shopify.com';
export const APP_BRIDGE_URL = `${SHOPIFY_CDN}/shopifycloud/app-bridge.js`;
export const APP_BRIDGE_UI_URL = `${SHOPIFY_CDN}/shopifycloud/app-bridge-ui-experimental.js`;
export const APP_HANDLE = import.meta.env?.SHOPIFY_APP_HANDLE;
export const APP_LINKS = [
	{href: SHOPIFY_CDN, rel: 'preconnect'},
	{as: 'script', href: APP_BRIDGE_URL, rel: 'preload'},
	{
		as: 'script',
		'data-api-key': API_KEY,
		href: APP_BRIDGE_UI_URL,
		rel: 'preload',
	},
	{
		href: `${SHOPIFY_CDN}/static/fonts/inter/v4/styles.css`,
		precedence: 'default',
		rel: 'stylesheet',
	},
];
export const APP_LOG_LEVEL = import.meta.env?.SHOPIFY_APP_LOG_LEVEL ?? 'error';
export const APP_URL = import.meta.env?.SHOPIFY_APP_URL;
